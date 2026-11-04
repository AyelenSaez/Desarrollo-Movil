// Servicio de autenticación: funciones que hablan con Firebase Auth
// para que las pantallas no tengan que hacerlo directamente.

// createUserWithEmailAndPassword: crea una cuenta nueva con correo y contraseña.
// updateProfile: actualiza datos del perfil del usuario (acá, el nombre).
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
// auth: instancia de Firebase Auth configurada en firebaseConfig.
import { auth } from '../config/firebaseConfig';
// traducirErrorFirebase: convierte el código de error de Firebase en un mensaje en español.
import { traducirErrorFirebase } from '../utils/firebaseErrors';

/**
 * Crea una cuenta en Firebase Auth y guarda el nombre del usuario (displayName).
 * No lanza excepciones: siempre devuelve un objeto con el resultado,
 * así la pantalla solo tiene que revisar `ok`.
 *
 * @param {{ nombre: string, correo: string, contrasena: string }} datos
 * @returns {Promise<
 *   { ok: true, usuario: object, nombreGuardado: boolean } |
 *   { ok: false, codigo: string, mensaje: string }
 * >}
 */
export async function registrarUsuario({ nombre, correo, contrasena }) {
  let credencial;
  // Paso 1: crear la cuenta. Si falla, se devuelve el error traducido.
  try {
    credencial = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena);
  } catch (error) {
    const codigo = error?.code ?? 'desconocido';
    console.error('Error de registro:', codigo, error?.message);
    return { ok: false, codigo, mensaje: traducirErrorFirebase(codigo) };
  }

  // Paso 2: guardar el nombre en el perfil.
  // La cuenta ya existe en este punto: si falla guardar el nombre,
  // el registro igual se considera exitoso.
  try {
    await updateProfile(credencial.user, { displayName: nombre.trim() });
    return { ok: true, usuario: credencial.user, nombreGuardado: true };
  } catch (error) {
    console.warn('No se pudo guardar el nombre:', error?.code);
    return { ok: true, usuario: credencial.user, nombreGuardado: false };
  }
}