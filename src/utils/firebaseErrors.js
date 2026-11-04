// Traduce los códigos de error de Firebase Auth a mensajes legibles para el usuario.
// Para agregar un caso nuevo, alcanza con sumar una línea al objeto.

const MENSAJES_ERROR = {
  'auth/email-already-in-use': 'Este correo ya está registrado. Probá iniciar sesión.',
  'auth/invalid-email': 'El formato del correo electrónico no es válido.',
  'auth/weak-password': 'La contraseña es demasiado débil. Revisá los requisitos.',
  'auth/missing-password': 'Ingresá una contraseña.',
  'auth/network-request-failed': 'No hay conexión a internet. Revisá tu conexión e intentá de nuevo.',
  'auth/too-many-requests': 'Hiciste demasiados intentos. Esperá unos minutos y volvé a intentar.',
  'auth/operation-not-allowed': 'El registro con correo no está habilitado en Firebase.',
  'auth/invalid-api-key': 'La clave API de Firebase no es válida. Revisá el archivo .env.',
  'auth/internal-error': 'Ocurrió un error en el servidor. Intentá de nuevo más tarde.',
};

const MENSAJE_GENERICO = 'Hubo un problema al registrar el usuario. Intentá de nuevo.';

export function traducirErrorFirebase(codigo) {
  return MENSAJES_ERROR[codigo] ?? MENSAJE_GENERICO;
}

// ---------------------------------------------------------------
// Errores de Firestore (las funciones de equipos, tipos y estados).
// 'sin-conexion' no es un código de Firebase: lo genera equipoService
// cuando una escritura tarda demasiado (sin internet, Firestore no
// devuelve error: deja la operación pendiente).
// ---------------------------------------------------------------

const MENSAJES_ERROR_FIRESTORE = {
  'permission-denied': 'No tenés permisos para realizar esta acción.',
  'unauthenticated': 'Tenés que iniciar sesión para realizar esta acción.',
  'not-found': 'El registro no existe o ya fue eliminado.',
  'unavailable': 'No hay conexión a internet. Revisá tu conexión e intentá de nuevo.',
  'sin-conexion': 'No hay conexión a internet. Revisá tu conexión e intentá de nuevo.',
  'deadline-exceeded': 'La operación tardó demasiado. Revisá tu conexión e intentá de nuevo.',
  'already-exists': 'Ya existe un registro con esos datos.',
  'resource-exhausted': 'Se superó el límite de uso de la base de datos. Intentá más tarde.',
  'aborted': 'La operación fue interrumpida. Intentá de nuevo.',
  'internal': 'Ocurrió un error en el servidor. Intentá de nuevo más tarde.',
};

const MENSAJE_GENERICO_FIRESTORE = 'Hubo un problema con la base de datos. Intentá de nuevo.';

export function traducirErrorFirestore(codigo) {
  return MENSAJES_ERROR_FIRESTORE[codigo] ?? MENSAJE_GENERICO_FIRESTORE;
}