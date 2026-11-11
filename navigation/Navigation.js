// Navegación principal de la app. Escucha si hay un usuario con sesión iniciada
// y, según eso, muestra las pantallas públicas (Login, Registro...) o las
// privadas (Home, Equipos...).

// React: para JSX. useEffect: ejecutar código al montar el componente.
// useState: guardar valores que, al cambiar, vuelven a dibujar la pantalla.
import React, { useEffect, useState } from 'react';
// Componentes básicos de React Native:
// ActivityIndicator = ruedita de carga, StyleSheet = crear estilos,
// Text = mostrar texto, View = contenedor (como un <div>).
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// NavigationContainer: contenedor obligatorio que guarda el estado de la navegación.
import { NavigationContainer } from '@react-navigation/native';
// createStackNavigator: crea una navegación "en pila" (cada pantalla se apila sobre la anterior).
import { createStackNavigator } from '@react-navigation/stack';
// onAuthStateChanged: avisa cada vez que el usuario inicia o cierra sesión.
// signOut: cierra la sesión del usuario actual.
import { onAuthStateChanged, signOut } from 'firebase/auth';
// auth: instancia de Firebase Auth ya configurada.
// isFirebaseConfigured: indica si están cargadas las variables del archivo .env.
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
// Pantallas de la aplicación que se registran en el navegador:
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import RegistroFallido from '../screens/RegistroFallido';
import Home from '../screens/Home';
import LoginExitoso from '../screens/LoginExitoso';
import ForgotPassword from '../screens/ForgotPassword';
import RegistroExitoso from '../screens/RegistroExitoso';
import ListadoEquipos from '../screens/ListadoEquipos';
import RegistroEquipo from '../screens/RegistroEquipo';
import ModificarEquipo from '../screens/ModificarEquipo';
import DetalleEquipo from '../screens/DetalleEquipo';
import PerfilUsuario from '../screens/PerfilUsuario';
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

// Stack: objeto con los componentes Stack.Navigator y Stack.Screen para definir las pantallas.
const Stack = createStackNavigator();

// Navigation: componente que decide qué grupo de pantallas mostrar según la sesión.
export default function Navigation() {
  // user: undefined = todavía no se sabe (cargando), null = sin sesión, objeto = usuario logueado
  const [user, setUser] = useState(undefined);
  // true = mostrar la pantalla de "login exitoso" antes de pasar a Home
  const [mostrarExito, setMostrarExito] = useState(false);
  // true = mostrar la pantalla de "registro exitoso" después de crear la cuenta
  // (Firebase inicia sesión al crear la cuenta; sin esto pasaría directo a Home)
  const [mostrarRegistroExito, setMostrarRegistroExito] = useState(false);

  // Al montar el componente se suscribe a los cambios de sesión de Firebase.
  // Devuelve la función para desuscribirse cuando el componente se desmonta.
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Botón "Iniciar sesión" de Registro exitoso: cierra la sesión que abrió Firebase y vuelve al Login
  const irAlLoginDespuesDeRegistro = async () => {
    try {
      await signOut(auth);
    } finally {
      setMostrarRegistroExito(false);
    }
  };

  // Si falta el archivo .env, se muestra un aviso en lugar de la app.
  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los datos de tu proyecto.
        </Text>
      </View>
    );
  }

  // Mientras Firebase verifica si hay sesión guardada, se muestra una ruedita de carga.
  if (user === undefined) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Se elige qué pantallas existen según el estado:
            1) Login exitoso  2) Registro exitoso  3) Usuario logueado  4) Sin sesión */}
        {user && mostrarExito ? (
          <Stack.Screen name="LoginExitoso" options={{ headerShown: false }}>
            {() => <LoginExitoso onContinuar={() => setMostrarExito(false)} />}
          </Stack.Screen>
        ) : user && mostrarRegistroExito ? (
          <Stack.Screen name="RegistroExitoso" options={{ headerShown: false }}>
            {() => <RegistroExitoso onIniciarSesion={irAlLoginDespuesDeRegistro} />}
          </Stack.Screen>
        ) : user ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio', headerShown: false }} />

            {/* Pantallas de Equipos: cada una tiene su propia flecha para volver */}
            <Stack.Screen
              name="ListadoEquipos"
              component={ListadoEquipos}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegistroEquipo"
              component={RegistroEquipo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ModificarEquipo"
              component={ModificarEquipo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DetalleEquipo"
              component={DetalleEquipo}
              options={{ headerShown: false }}
            />

            {/* Mi perfil: tiene su propia flecha para volver en el encabezado azul */}
            <Stack.Screen
              name="PerfilUsuario"
              component={PerfilUsuario}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {/* Login recibe setMostrarExito para activar la pantalla de "login exitoso" */}
            <Stack.Screen name="Login" options={{ title: 'Iniciar sesión' }}>
              {(props) => <Login {...props} setMostrarExito={setMostrarExito} />}
            </Stack.Screen>

            {/* SignUp recibe setMostrarRegistroExito, así que va con función hija (sin component=) */}
            <Stack.Screen name="SignUp" options={{ title: 'Registro' }}>
              {(props) => (
                <SignUp {...props} setMostrarRegistroExito={setMostrarRegistroExito} />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="RegistroFallido"
              component={RegistroFallido}
              options={{ headerShown: false }}
            />

            {/* Barra de navegación con título y flecha para volver al Login */}
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ title: 'Recuperar contraseña', headerBackTitle: 'Volver' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Estilos de las pantallas de aviso y de carga (contenido centrado).
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { fontFamily: FUENTES.regular, textAlign: 'center', fontSize: 16 },
});