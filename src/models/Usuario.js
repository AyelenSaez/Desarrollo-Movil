// S6-03 — Modelo de la tabla USUARIOS.
// En Firestore cada usuario es un documento de la colección "usuarios"
// y su id es el UID que le da Firebase Auth al crear la cuenta,
// así se puede buscar el perfil del usuario con sesión iniciada sin hacer una consulta.

// Nombre de la colección en Firestore (tiene que coincidir con la consola)
export const COLECCION_USUARIOS = 'usuarios';

/**
 * Tabla USUARIOS
 * @typedef {Object} Usuario
 * @property {string} id_usuario    PK (id del documento = UID de Firebase Auth)
 * @property {string} nombre        nombre completo, 2 caracteres o más
 * @property {string} correo        correo electrónico (el mismo de Firebase Auth)
 * @property {string} telefono      10 dígitos, se guarda como texto (ej: "3874123452")
 * @property {Date} fecha_creacion             fecha en que se creó la cuenta
 * @property {Date} [fecha_ultima_modificacion] opcional, se agrega al modificar el perfil
 */

// Perfil vacío: valores iniciales de los campos del formulario de perfil.
export const USUARIO_VACIO = {
  nombre: '',
  correo: '',
  telefono: '',
};
