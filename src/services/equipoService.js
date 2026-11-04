// Funciones de Firestore (base de datos de Firebase):
import {
  collection,      // referencia a una colección (como una tabla)
  doc,             // referencia a un documento puntual (como una fila)
  addDoc,          // agrega un documento nuevo con id automático
  getDoc,          // lee un documento por su id
  getDocs,         // lee varios documentos (una colección o una consulta)
  updateDoc,       // modifica campos de un documento existente
  deleteDoc,       // borra un documento
  query,           // arma una consulta con filtros
  where,           // filtro de una consulta (campo == valor)
  limit,           // limita la cantidad de resultados de una consulta
  serverTimestamp, // fecha y hora del servidor de Firebase al guardar
} from 'firebase/firestore';
// db: instancia de Firestore configurada en firebaseConfig.
import { db } from '../config/firebaseConfig';
// COLECCIONES: nombres de las colecciones. Los *Schema: validaciones zod de cada tabla.
import {
  COLECCIONES,
  equipoSchema,
  tipoEquipoSchema,
  estadoEquipoSchema,
} from '../models/Equipo';
// LISTA_TIPOS_EQUIPO: tipos iniciales que se precargan si la colección está vacía.
import { LISTA_TIPOS_EQUIPO } from '../constants/tiposEquipo';
// traducirErrorFirestore: convierte el código de error de Firestore en un mensaje en español.
import { traducirErrorFirestore } from '../utils/firebaseErrors';
 
// Todas las funciones del CRUD de equipos, tipos y estados.
// Igual que authService: no lanzan excepciones, siempre devuelven
// { ok: true, ... } o { ok: false, codigo, mensaje }, así las pantallas solo revisan `ok`.
 
// Tiempo máximo de espera al escribir. Sin internet, Firestore no devuelve
// un error: deja la operación pendiente. Por eso se corta la espera.
const TIEMPO_ESPERA_MS = 8000;
 
// Envuelve una operación (promesa): si no termina en TIEMPO_ESPERA_MS,
// la corta con el error 'sin-conexion'. Promise.race se queda con la que termine primero.
function conTiempoLimite(promesa) {
  let temporizador;
  const limite = new Promise((_, reject) => {
    temporizador = setTimeout(() => reject({ code: 'sin-conexion' }), TIEMPO_ESPERA_MS);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}
 
// Todas las funciones pasan por acá: el mensaje sale de traducirErrorFirestore
function resultadoError(contexto, error) {
  const codigo = error?.code ?? 'desconocido';
  console.error(`Error al ${contexto}:`, codigo, error?.message);
  return { ok: false, codigo, mensaje: traducirErrorFirestore(codigo) };
}
 
// Valida con zod y devuelve los datos limpios, o el primer mensaje de error
function validar(schema, datos) {
  const resultado = schema.safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };
  return { ok: false, codigo: 'validacion', mensaje: resultado.error.issues[0].message };
}
 
// ---------- Funciones genéricas que comparten las tres tablas ----------
// campoId es el nombre de la PK: id_equipo, id_tipoeq o id_estadoeq
 
// Lee todos los documentos de una colección (opcionalmente con un filtro where)
// y devuelve un array de objetos con el id incluido.
async function listar(coleccion, campoId, filtro) {
  try {
    const ref = collection(db, coleccion);
    const snap = await getDocs(filtro ? query(ref, filtro) : ref);
    return { ok: true, datos: snap.docs.map((d) => ({ [campoId]: d.id, ...d.data() })) };
  } catch (error) {
    return resultadoError(`listar ${coleccion}`, error);
  }
}
 
// Lee un único documento por su id. Si no existe, devuelve el error 'not-found'.
async function obtener(coleccion, campoId, id) {
  try {
    const snap = await getDoc(doc(db, coleccion, id));
    if (!snap.exists()) {
      return { ok: false, codigo: 'not-found', mensaje: traducirErrorFirestore('not-found') };
    }
    return { ok: true, dato: { [campoId]: snap.id, ...snap.data() } };
  } catch (error) {
    return resultadoError(`obtener ${coleccion}`, error);
  }
}
 
// Valida los datos con el esquema y, si están bien, crea un documento nuevo.
async function crear(coleccion, campoId, schema, datos) {
  const validacion = validar(schema, datos);
  if (!validacion.ok) return validacion;
  try {
    const ref = await conTiempoLimite(addDoc(collection(db, coleccion), validacion.datos));
    return { ok: true, dato: { [campoId]: ref.id, ...validacion.datos } };
  } catch (error) {
    return resultadoError(`crear ${coleccion}`, error);
  }
}
 
// Valida los datos y modifica el documento con ese id.
async function actualizar(coleccion, schema, id, datos) {
  // partial(): permite actualizar solo algunos campos
  const validacion = validar(schema.partial(), datos);
  if (!validacion.ok) return validacion;
  try {
    await conTiempoLimite(updateDoc(doc(db, coleccion, id), validacion.datos));
    return { ok: true };
  } catch (error) {
    return resultadoError(`actualizar ${coleccion}`, error);
  }
}
 
// Borra el documento con ese id de la colección indicada.
async function eliminar(coleccion, id) {
  try {
    await conTiempoLimite(deleteDoc(doc(db, coleccion, id)));
    return { ok: true };
  } catch (error) {
    return resultadoError(`eliminar ${coleccion}`, error);
  }
}
 
// No se puede borrar un tipo/estado si algún equipo lo está usando (es FK en EQUIPOS)
async function eliminarSiNoEstaEnUso(coleccion, campoFk, id, mensajeEnUso) {
  try {
    const q = query(collection(db, COLECCIONES.EQUIPOS), where(campoFk, '==', id), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return { ok: false, codigo: 'en-uso', mensaje: mensajeEnUso };
  } catch (error) {
    return resultadoError(`eliminar ${coleccion}`, error);
  }
  return eliminar(coleccion, id);
}
 
// ---------- EQUIPOS ----------
 
// Devuelve todos los equipos tal como están guardados (con los id de tipo y estado).
export const obtenerEquipos = () => listar(COLECCIONES.EQUIPOS, 'id_equipo');

// Devuelve solo los equipos de un tipo determinado.
export const obtenerEquiposPorTipo = (id_tipoeq) =>
  listar(COLECCIONES.EQUIPOS, 'id_equipo', where('id_tipoeq', '==', id_tipoeq));

// Devuelve un equipo por su id.
export const obtenerEquipoPorId = (id) => obtener(COLECCIONES.EQUIPOS, 'id_equipo', id);

// Crea un equipo sin verificar duplicados (para eso está registrarEquipo).
/** @param {{ id_tipoeq: string, id_estadoeq: string, nombre_equipo: string, cantidad_equipo: number }} datos */
export const crearEquipo = (datos) =>
  crear(COLECCIONES.EQUIPOS, 'id_equipo', equipoSchema, datos);

// Actualiza algunos campos de un equipo sin verificar duplicados (para eso está modificarEquipo).
export const actualizarEquipo = (id, datos) =>
  actualizar(COLECCIONES.EQUIPOS, equipoSchema, id, datos);
 
/**
 * Lista todos los equipos con nombre, tipo, cantidad y estado,
 * ordenados por nombre, para mostrarlos en la pantalla de listado.
 * Devuelve { ok: true, datos } o { ok: false, codigo, mensaje }.
 */
export async function listarEquipos() {
  // Promise.all: hace las tres consultas al mismo tiempo y espera a que terminen todas
  const [equipos, tipos, estados] = await Promise.all([
    obtenerEquipos(),
    obtenerTiposEquipo(),
    obtenerEstadosEquipo(),
  ]);
 
  if (!equipos.ok) return equipos;
  if (!tipos.ok) return tipos;
  if (!estados.ok) return estados;
 
  // Diccionarios id -> nombre, para reemplazar los id por texto legible
  const nombreTipo = Object.fromEntries(
    tipos.datos.map((t) => [t.id_tipoeq, t.nombre_tipoeq])
  );
  const nombreEstado = Object.fromEntries(
    estados.datos.map((e) => [e.id_estadoeq, e.nombre_estadoeq])
  );
 
  const datos = equipos.datos
    .map((e) => ({
      id_equipo: e.id_equipo,
      // Si el documento no tiene nombre_equipo, no rompe el orden de la lista
      nombre: e.nombre_equipo ?? 'Sin nombre',
      tipo: nombreTipo[e.id_tipoeq] ?? 'Sin tipo',
      cantidad: e.cantidad_equipo,
      estado: nombreEstado[e.id_estadoeq] ?? 'Sin estado',
      descripcion: e.descripcion_equipo ?? '',
    }))
    // Orden alfabético en español, sin distinguir mayúsculas ni acentos
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  return { ok: true, datos };
}

/**
 * Trae un equipo con los nombres de su tipo y estado (no solo los id),
 * para la pantalla de detalle.
 * Devuelve { ok: true, dato } o { ok: false, codigo, mensaje }.
 * dato: { id_equipo, nombre, tipo, estado, cantidad, descripcion, fechaAlta (Date o null) }
 */
export async function obtenerDetalleEquipo(id) {
  const [equipo, tipos, estados] = await Promise.all([
    obtenerEquipoPorId(id),
    obtenerTiposEquipo(),
    obtenerEstadosEquipo(),
  ]);

  if (!equipo.ok) return equipo;
  if (!tipos.ok) return tipos;
  if (!estados.ok) return estados;

  const e = equipo.dato;
  const tipo = tipos.datos.find((t) => t.id_tipoeq === e.id_tipoeq);
  const estado = estados.datos.find((s) => s.id_estadoeq === e.id_estadoeq);

  return {
    ok: true,
    dato: {
      id_equipo: e.id_equipo,
      nombre: e.nombre_equipo ?? 'Sin nombre',
      tipo: tipo?.nombre_tipoeq ?? 'Sin tipo',
      estado: estado?.nombre_estadoeq ?? 'Sin estado',
      cantidad: e.cantidad_equipo,
      descripcion: e.descripcion_equipo ?? '',
      // fecha_alta es un Timestamp de Firestore: toDate() lo pasa a fecha de JS
      fechaAlta: e.fecha_alta?.toDate ? e.fecha_alta.toDate() : null,
    },
  };
}
 
// ---------- VERIFICAR DUPLICADOS Y REGISTRAR EQUIPO (S4-08 / S4-09) ----------
 
/**
 * S4-08: consulta si ya existe otro equipo con el mismo nombre y tipo.
 * Firestore no tiene campos únicos, por eso se consulta antes de guardar.
 * idExcluir: id del equipo que se está modificando (se ignora a sí mismo).
 * Devuelve { ok: true } o { ok: false, codigo: 'duplicado', mensaje }.
 */
export async function verificarDuplicado(nombre_equipo, id_tipoeq, idExcluir = null) {
  const nombre = String(nombre_equipo ?? '').trim();
 
  if (!nombre || !id_tipoeq) {
    return {
      ok: false,
      codigo: 'validacion',
      mensaje: 'Falta el nombre o el tipo del equipo para verificar duplicados.',
    };
  }
 
  try {
    const q = query(
      collection(db, COLECCIONES.EQUIPOS),
      where('nombre_equipo', '==', nombre),
      where('id_tipoeq', '==', id_tipoeq)
    );
    const snap = await getDocs(q);
    const hayOtroIgual = snap.docs.some((d) => d.id !== idExcluir);
 
    if (hayOtroIgual) {
      return {
        ok: false,
        codigo: 'duplicado',
        mensaje: 'Ya existe un equipo con el mismo nombre y tipo.',
      };
    }
    return { ok: true };
  } catch (error) {
    return resultadoError('verificar duplicados de equipos', error);
  }
}
 
/**
 * S4-09: crea un equipo. Valida con equipoSchema, verifica que no esté
 * duplicado y lo guarda en "equipos" con su fecha de alta.
 * @param {{ id_tipoeq: string, id_estadoeq: string, nombre_equipo: string, cantidad_equipo: number }} datos
 * Devuelve { ok: true, dato, mensaje } o { ok: false, codigo, mensaje }.
 */
export async function registrarEquipo(datos) {
  const validacion = validar(equipoSchema, datos);
  if (!validacion.ok) return validacion;
 
  const { nombre_equipo, id_tipoeq } = validacion.datos;
  const duplicado = await verificarDuplicado(nombre_equipo, id_tipoeq);
  if (!duplicado.ok) return duplicado;
 
  try {
    const ref = await conTiempoLimite(
      addDoc(collection(db, COLECCIONES.EQUIPOS), {
        ...validacion.datos,
        // Si en el diagrama la fecha de alta se llama distinto, cambiá este nombre
        fecha_alta: serverTimestamp(),
      })
    );
    return {
      ok: true,
      dato: { id_equipo: ref.id, ...validacion.datos },
      mensaje: 'Equipo registrado correctamente.',
    };
  } catch (error) {
    return resultadoError('registrar equipo', error);
  }
}
 
// ---------- MODIFICAR Y ELIMINAR EQUIPO ----------
 
/**
 * Modifica un equipo. Valida los datos con equipoSchema, verifica que no haya
 * otro equipo con el mismo nombre y tipo (ignorando al propio equipo) y actualiza
 * nombre, tipo, cantidad y estado, guardando la fecha de última modificación.
 * @param {string} id  id del equipo a modificar (id_equipo)
 * @param {{ id_tipoeq: string, id_estadoeq: string, nombre_equipo: string, cantidad_equipo: number }} datos
 * Devuelve { ok: true, dato, mensaje } o { ok: false, codigo, mensaje }.
 * Si el equipo no existe, devuelve codigo 'not-found'.
 */
export async function modificarEquipo(id, datos) {
  if (!id) {
    return {
      ok: false,
      codigo: 'validacion',
      mensaje: 'Falta el identificador del equipo a modificar.',
    };
  }
 
  const validacion = validar(equipoSchema, datos);
  if (!validacion.ok) return validacion;
 
  // Se pasa el id para que el equipo no se detecte como duplicado de sí mismo
  const { nombre_equipo, id_tipoeq } = validacion.datos;
  const duplicado = await verificarDuplicado(nombre_equipo, id_tipoeq, id);
  if (!duplicado.ok) return duplicado;
 
  try {
    await conTiempoLimite(
      updateDoc(doc(db, COLECCIONES.EQUIPOS, id), {
        ...validacion.datos,
        // Si en el diagrama la fecha de modificación se llama distinto, cambiá este nombre
        fecha_modificacion: serverTimestamp(),
      })
    );
    return {
      ok: true,
      dato: { id_equipo: id, ...validacion.datos },
      mensaje: 'Equipo modificado correctamente.',
    };
  } catch (error) {
    // Si el id no existe, Firestore devuelve 'not-found' y el mensaje sale de traducirErrorFirestore
    return resultadoError('modificar equipo', error);
  }
}
 
/**
 * Elimina un equipo. Primero verifica que exista y después lo borra de "equipos".
 * @param {string} id  id del equipo a eliminar (id_equipo)
 * Devuelve { ok: true, mensaje } o { ok: false, codigo, mensaje }.
 * Si el equipo no existe, devuelve codigo 'not-found'.
 */
export async function eliminarEquipo(id) {
  if (!id) {
    return {
      ok: false,
      codigo: 'validacion',
      mensaje: 'Falta el identificador del equipo a eliminar.',
    };
  }
 
  const existente = await obtenerEquipoPorId(id);
  if (!existente.ok) return existente;
 
  const eliminado = await eliminar(COLECCIONES.EQUIPOS, id);
  if (!eliminado.ok) return eliminado;
 
  return { ok: true, mensaje: 'Equipo eliminado correctamente.' };
}
 
// ---------- TIPOS DE EQUIPOS ----------
 
// Devuelve todos los tipos de equipo.
export const obtenerTiposEquipo = () => listar(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq');

// Devuelve un tipo de equipo por su id.
export const obtenerTipoEquipoPorId = (id) =>
  obtener(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq', id);

// Crea un tipo de equipo nuevo.
export const crearTipoEquipo = (datos) =>
  crear(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq', tipoEquipoSchema, datos);

// Modifica el nombre de un tipo de equipo.
export const actualizarTipoEquipo = (id, datos) =>
  actualizar(COLECCIONES.TIPOS_EQUIPOS, tipoEquipoSchema, id, datos);

// Elimina un tipo de equipo, solo si ningún equipo lo usa.
export const eliminarTipoEquipo = (id) =>
  eliminarSiNoEstaEnUso(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq', id,
    'No se puede eliminar: hay equipos de este tipo.');
 
/** Si la colección de tipos está vacía, carga Sonido, Iluminación e Infraestructura */
export async function cargarTiposIniciales() {
  const existentes = await obtenerTiposEquipo();
  if (!existentes.ok || existentes.datos.length > 0) return existentes;
  for (const nombre_tipoeq of LISTA_TIPOS_EQUIPO) {
    const creado = await crearTipoEquipo({ nombre_tipoeq });
    if (!creado.ok) return creado;
  }
  return obtenerTiposEquipo();
}
 
// ---------- ESTADOS DE EQUIPOS ----------
 
// Devuelve todos los estados de equipo.
export const obtenerEstadosEquipo = () => listar(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq');

// Devuelve un estado de equipo por su id.
export const obtenerEstadoEquipoPorId = (id) =>
  obtener(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq', id);

// Crea un estado de equipo nuevo.
export const crearEstadoEquipo = (datos) =>
  crear(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq', estadoEquipoSchema, datos);

// Modifica el nombre de un estado de equipo.
export const actualizarEstadoEquipo = (id, datos) =>
  actualizar(COLECCIONES.ESTADOS_EQUIPOS, estadoEquipoSchema, id, datos);

// Elimina un estado de equipo, solo si ningún equipo lo usa.
export const eliminarEstadoEquipo = (id) =>
  eliminarSiNoEstaEnUso(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq', id,
    'No se puede eliminar: hay equipos con este estado.');