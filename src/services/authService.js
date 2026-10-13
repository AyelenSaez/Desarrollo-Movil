import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
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
  try {
    credencial = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena);
  } catch (error) {
    const codigo = error?.code ?? 'desconocido';
    console.error('Error de registro:', codigo, error?.message);
    return { ok: false, codigo, mensaje: traducirErrorFirebase(codigo) };
  }

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