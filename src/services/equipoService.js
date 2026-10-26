import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import {
  COLECCIONES,
  equipoSchema,
  tipoEquipoSchema,
  estadoEquipoSchema,
} from '../models/Equipo';
import { LISTA_TIPOS_EQUIPO } from '../constants/tiposEquipo';

// Todas las funciones del CRUD de equipos, tipos y estados.
// Igual que authService: no lanzan excepciones, siempre devuelven
// { ok: true, ... } o { ok: false, codigo, mensaje }, así las pantallas solo revisan `ok`.

const MENSAJES_ERROR = {
  'permission-denied': 'No tenés permisos para realizar esta acción.',
  'unavailable': 'No hay conexión a internet. Revisá tu conexión e intentá de nuevo.',
  'not-found': 'El registro no existe.',
};
const MENSAJE_GENERICO = 'Hubo un problema con la base de datos. Intentá de nuevo.';

function resultadoError(contexto, error) {
  const codigo = error?.code ?? 'desconocido';
  console.error(`Error al ${contexto}:`, codigo, error?.message);
  return { ok: false, codigo, mensaje: MENSAJES_ERROR[codigo] ?? MENSAJE_GENERICO };
}

// Valida con zod y devuelve los datos limpios, o el primer mensaje de error
function validar(schema, datos) {
  const resultado = schema.safeParse(datos);
  if (resultado.success) return { ok: true, datos: resultado.data };
  return { ok: false, codigo: 'validacion', mensaje: resultado.error.issues[0].message };
}

// ---------- Funciones genéricas que comparten las tres tablas ----------
// campoId es el nombre de la PK: id_equipo, id_tipoeq o id_estadoeq

async function listar(coleccion, campoId, filtro) {
  try {
    const ref = collection(db, coleccion);
    const snap = await getDocs(filtro ? query(ref, filtro) : ref);
    return { ok: true, datos: snap.docs.map((d) => ({ [campoId]: d.id, ...d.data() })) };
  } catch (error) {
    return resultadoError(`listar ${coleccion}`, error);
  }
}

async function obtener(coleccion, campoId, id) {
  try {
    const snap = await getDoc(doc(db, coleccion, id));
    if (!snap.exists()) {
      return { ok: false, codigo: 'not-found', mensaje: MENSAJES_ERROR['not-found'] };
    }
    return { ok: true, dato: { [campoId]: snap.id, ...snap.data() } };
  } catch (error) {
    return resultadoError(`obtener ${coleccion}`, error);
  }
}

async function crear(coleccion, campoId, schema, datos) {
  const validacion = validar(schema, datos);
  if (!validacion.ok) return validacion;
  try {
    const ref = await addDoc(collection(db, coleccion), validacion.datos);
    return { ok: true, dato: { [campoId]: ref.id, ...validacion.datos } };
  } catch (error) {
    return resultadoError(`crear ${coleccion}`, error);
  }
}

async function actualizar(coleccion, schema, id, datos) {
  // partial(): permite actualizar solo algunos campos
  const validacion = validar(schema.partial(), datos);
  if (!validacion.ok) return validacion;
  try {
    await updateDoc(doc(db, coleccion, id), validacion.datos);
    return { ok: true };
  } catch (error) {
    return resultadoError(`actualizar ${coleccion}`, error);
  }
}

async function eliminar(coleccion, id) {
  try {
    await deleteDoc(doc(db, coleccion, id));
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

export const obtenerEquipos = () => listar(COLECCIONES.EQUIPOS, 'id_equipo');

export const obtenerEquiposPorTipo = (id_tipoeq) =>
  listar(COLECCIONES.EQUIPOS, 'id_equipo', where('id_tipoeq', '==', id_tipoeq));

export const obtenerEquipoPorId = (id) => obtener(COLECCIONES.EQUIPOS, 'id_equipo', id);

/** @param {{ id_tipoeq: string, id_estadoeq: string, nombre_equipo: string, cantidad_equipo: number }} datos */
export const crearEquipo = (datos) =>
  crear(COLECCIONES.EQUIPOS, 'id_equipo', equipoSchema, datos);

export const actualizarEquipo = (id, datos) =>
  actualizar(COLECCIONES.EQUIPOS, equipoSchema, id, datos);

export const eliminarEquipo = (id) => eliminar(COLECCIONES.EQUIPOS, id);

/**
 * Lista todos los equipos con nombre, tipo, cantidad y estado,
 * ordenados por nombre, para mostrarlos en la pantalla de listado.
 * Devuelve { ok: true, datos } o { ok: false, codigo, mensaje }.
 */
export async function listarEquipos() {
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
      nombre: e.nombre_equipo,
      tipo: nombreTipo[e.id_tipoeq] ?? 'Sin tipo',
      cantidad: e.cantidad_equipo,
      estado: nombreEstado[e.id_estadoeq] ?? 'Sin estado',
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  return { ok: true, datos };
}
// ---------- TIPOS DE EQUIPOS ----------

export const obtenerTiposEquipo = () => listar(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq');

export const obtenerTipoEquipoPorId = (id) =>
  obtener(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq', id);

export const crearTipoEquipo = (datos) =>
  crear(COLECCIONES.TIPOS_EQUIPOS, 'id_tipoeq', tipoEquipoSchema, datos);

export const actualizarTipoEquipo = (id, datos) =>
  actualizar(COLECCIONES.TIPOS_EQUIPOS, tipoEquipoSchema, id, datos);

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

export const obtenerEstadosEquipo = () => listar(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq');

export const obtenerEstadoEquipoPorId = (id) =>
  obtener(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq', id);

export const crearEstadoEquipo = (datos) =>
  crear(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq', estadoEquipoSchema, datos);

export const actualizarEstadoEquipo = (id, datos) =>
  actualizar(COLECCIONES.ESTADOS_EQUIPOS, estadoEquipoSchema, id, datos);

export const eliminarEstadoEquipo = (id) =>
  eliminarSiNoEstaEnUso(COLECCIONES.ESTADOS_EQUIPOS, 'id_estadoeq', id,
    'No se puede eliminar: hay equipos con este estado.');
