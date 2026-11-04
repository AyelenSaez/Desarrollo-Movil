// Configuración e inicialización de Firebase (autenticación y base de datos).
// El resto de la app importa `auth` y `db` desde acá.

// initializeApp: crea la conexión de la app con el proyecto de Firebase.
import { initializeApp } from 'firebase/app';
// getAuth: obtiene la instancia de Auth si ya existe.
// initializeAuth: crea la instancia de Auth con opciones personalizadas.
// getReactNativePersistence: hace que la sesión se guarde en el teléfono.
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
// getFirestore: obtiene la base de datos si ya existe.
// initializeFirestore: crea la base de datos con opciones personalizadas.
import { getFirestore, initializeFirestore } from 'firebase/firestore';
// AsyncStorage: almacenamiento local del teléfono; se usa para recordar la sesión
// aunque se cierre la app.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Datos del proyecto de Firebase, leídos de las variables del archivo .env.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// true solo si todas las variables tienen valor (si falta alguna, la app muestra un aviso).
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let auth = null;
let db = null;
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  // Se inicializa Auth guardando la sesión en AsyncStorage.
  // Si ya estaba inicializado (recarga en caliente), se reutiliza el existente.
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if (error.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
  // Base de datos Firestore (la usan los servicios, nunca las pantallas directamente).
  // Long polling: en React Native / Expo Go la conexión por defecto se queda colgada.
  try {
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch (error) {
    db = getFirestore(app); // ya estaba inicializada (recarga en caliente)
  }
}

// auth: para iniciar/cerrar sesión y registrar usuarios. db: para leer/escribir en Firestore.
export { auth, db };
