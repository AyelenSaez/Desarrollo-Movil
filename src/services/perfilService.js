// Servicio de perfil: funciones del perfil del usuario con sesión iniciada,
// para que las pantallas no tengan que hablar con Firebase directamente.

// doc: referencia a un documento de Firestore.
// updateDoc: modifica solo los campos indicados de un documento.
// serverTimestamp: fecha y hora del servidor de Firebase.
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
// signOut: cierra la sesión del usuario en Firebase Auth.
import { signOut } from 'firebase/auth';
// auth y db: instancias de Firebase configuradas en firebaseConfig.
import { auth, db } from '../config/firebaseConfig';
// traducirErrorFirebase: convierte el código de error de Firebase en un mensaje en español.
import { traducirErrorFirebase } from '../utils/firebaseErrors';
// perfilSchema: esquema zod del perfil (tarea S6-04, Alarcon Facundo).
import { perfilSchema } from '../validations/perfilSchema';
// COLECCION_USUARIOS: nombre de la colección de usuarios en Firestore (modelo Usuario, S6-03).
import { COLECCION_USUARIOS } from '../models/Usuario';

/**
 * Modifica el nombre y el teléfono del usuario con sesión iniciada.
 * Valida los datos con el esquema zod antes de guardarlos.
 * No lanza excepciones: siempre devuelve un objeto con el resultado.
 *
 * @param {{ nombre: string, telefono: string }} datos
 * @returns {Promise<
 *   { ok: true, datos: { nombre: string, telefono: string } } |
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
    .pick({ nombre: true, telefono: true })
    .safeParse(datos);

  if (!validacion.success) {
    return {
      ok: false,
      codigo: 'validacion',
      mensaje: validacion.error.issues[0].message,
    };
  }

  const { nombre, telefono } = validacion.data;

  // Paso 3: actualizar el documento del usuario (su ID es el UID de Auth).
  try {
    await updateDoc(doc(db, COLECCION_USUARIOS, usuario.uid), {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      fecha_ultima_modificacion: serverTimestamp(),
    });
    return { ok: true, datos: { nombre: nombre.trim(), telefono: telefono.trim() } };
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