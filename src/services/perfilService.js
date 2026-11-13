// Servicio de perfil: funciones del perfil del usuario con sesión iniciada,
// para que las pantallas no tengan que hablar con Firebase directamente.

// doc: referencia a un documento de Firestore.
// setDoc: crea o actualiza un documento (con merge: true solo toca los campos indicados).
// serverTimestamp: fecha y hora del servidor de Firebase.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
// signOut: cierra la sesión del usuario en Firebase Auth.
import { signOut } from 'firebase/auth';
// auth y db: instancias de Firebase configuradas en firebaseConfig.
import { auth, db } from '../config/firebaseConfig';
// traducirErrorFirebase: convierte el código de error de Firebase en un mensaje en español.
import { traducirErrorFirebase, traducirErrorFirestore } from '../utils/firebaseErrors';
// perfilSchema: esquema zod del perfil (tarea S6-04, Alarcon Facundo).
import { perfilSchema } from '../validations/perfilSchema';
// COLECCION_USUARIOS: nombre de la colección de usuarios en Firestore (modelo Usuario, S6-03).
import { COLECCION_USUARIOS } from '../models/Usuario';

/**
 * Modifica el nombre, el apellido y el teléfono del usuario con sesión iniciada.
 * Valida los datos con el esquema zod antes de guardarlos.
 * Si el usuario todavía no tiene documento en Firestore (cuenta vieja o
 * registro que no pudo guardar el perfil), lo crea.
 * No lanza excepciones: siempre devuelve un objeto con el resultado.
 *
 * @param {{ nombre: string, apellido: string, telefono: string }} datos
 * @returns {Promise<
 *   { ok: true, datos: { nombre: string, apellido: string, telefono: string } } |
 *   { ok: false, codigo: string, mensaje: string }
 * >}
 */
export async function modificarPerfil(datos) {
  // Paso 1: verificar que haya una sesión iniciada.
  const usuario = auth.currentUser;
  if (!usuario) {
    return { ok: false, codigo: 'sin-sesion', mensaje: 'No hay una sesión iniciada.' };
  }

  // Paso 2: validar solo los campos que se modifican.
  const validacion = perfilSchema
    .pick({ nombre: true, apellido: true, telefono: true })
    .safeParse(datos);

  if (!validacion.success) {
    return {
      ok: false,
      codigo: 'validacion',
      mensaje: validacion.error.issues[0].message,
    };
  }

  const { nombre, apellido, telefono } = validacion.data;

  // Paso 3: guardar en el documento del usuario (su ID es el UID de Auth).
  // setDoc con merge: true actualiza solo estos campos y, si el documento
  // no existe, lo crea (updateDoc fallaría con "not-found").
  try {
    await setDoc(
      doc(db, COLECCION_USUARIOS, usuario.uid),
      {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: usuario.email ?? '',
        telefono: telefono.trim(),
        fecha_ultima_modificacion: serverTimestamp(),
      },
      { merge: true }
    );
    return {
      ok: true,
      datos: { nombre: nombre.trim(), apellido: apellido.trim(), telefono: telefono.trim() },
    };
  } catch (error) {
    const codigo = error?.code ?? 'desconocido';
    console.error('Error al modificar el perfil:', codigo, error?.message);
    return { ok: false, codigo, mensaje: traducirErrorFirebase(codigo) };
  }
}

/**
 * Cierra la sesión del usuario actual en Firebase Auth.
 * No lanza excepciones: siempre devuelve un objeto con el resultado.
 *
 * @returns {Promise<{ ok: true } | { ok: false, codigo: string, mensaje: string }>}
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    const codigo = error?.code ?? 'desconocido';
    console.error('Error al cerrar sesión:', codigo, error?.message);
    return { ok: false, codigo, mensaje: traducirErrorFirebase(codigo) };
  }
}

// Tiempo máximo de espera al escribir. Sin internet, Firestore no devuelve
// un error: deja la operación pendiente. Por eso se corta la espera.
const TIEMPO_ESPERA_MS = 8000;

// Si la operación no termina en TIEMPO_ESPERA_MS, la corta con el error 'sin-conexion'.
function conTiempoLimite(promesa) {
  let temporizador;
  const limite = new Promise((_, reject) => {
    temporizador = setTimeout(() => reject({ code: 'sin-conexion' }), TIEMPO_ESPERA_MS);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

/**
 * S6-05: guarda el documento del usuario en la colección "usuarios".
 * El id del documento es el UID de Firebase Auth. Se llama justo después
 * de crear la cuenta en el registro.
 * No lanza excepciones: siempre devuelve un objeto con el resultado.
 *
 * @param {string} uid  UID del usuario recién creado en Firebase Auth
 * @param {{ nombre: string, apellido?: string, email: string, telefono?: string }} datos
 * @returns {Promise<{ ok: true } | { ok: false, codigo: string, mensaje: string }>}
 */
export async function crearPerfil(uid, { nombre, apellido = '', email, telefono = '' }) {
  if (!uid) {
    return { ok: false, codigo: 'sin-sesion', mensaje: 'Falta el identificador del usuario.' };
  }

  try {
    await conTiempoLimite(
      setDoc(doc(db, COLECCION_USUARIOS, uid), {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        fecha_alta: serverTimestamp(),
        fecha_ultima_modificacion: serverTimestamp(),
      })
    );
    return { ok: true };
  } catch (error) {
    const codigo = error?.code ?? 'desconocido';
    console.error('Error al guardar el perfil:', codigo, error?.message);
    return { ok: false, codigo, mensaje: traducirErrorFirestore(codigo) };
  }
}

/**
 * S6-06: lee el perfil del usuario con sesión iniciada.
 * Devuelve nombre, apellido, correo y teléfono, o un error si no hay sesión
 * o si el documento no existe.
 * Si el documento no existe, el error trae igual "datos" con el correo de la
 * cuenta, para que la pantalla pueda completar el perfil y guardarlo.
 * No lanza excepciones: siempre devuelve un objeto con el resultado.
 *
 * @returns {Promise<
 *   { ok: true, datos: { nombre: string, apellido: string, email: string, telefono: string } } |
 *   { ok: false, codigo: string, mensaje: string, datos?: object }
 * >}
 */
export async function obtenerPerfil() {
  // Paso 1: verificar que haya una sesión iniciada.
  const usuario = auth.currentUser;
  if (!usuario) {
    return { ok: false, codigo: 'sin-sesion', mensaje: 'No hay una sesión iniciada.' };
  }

  // Paso 2: leer el documento del usuario (su ID es el UID de Auth).
  try {
    const snap = await getDoc(doc(db, COLECCION_USUARIOS, usuario.uid));
    if (!snap.exists()) {
      return {
        ok: false,
        codigo: 'not-found',
        mensaje: 'Todavía no cargaste tus datos. Completalos y tocá "Guardar cambios".',
        datos: { nombre: '', apellido: '', email: usuario.email ?? '', telefono: '' },
      };
    }

    const d = snap.data();
    return {
      ok: true,
      datos: {
        nombre: d.nombre ?? '',
        apellido: d.apellido ?? '',
        email: d.email ?? usuario.email ?? '',
        telefono: d.telefono ?? '',
      },
    };
  } catch (error) {
    const codigo = error?.code ?? 'desconocido';
    console.error('Error al obtener el perfil:', codigo, error?.message);
    return { ok: false, codigo, mensaje: traducirErrorFirestore(codigo) };
  }
}