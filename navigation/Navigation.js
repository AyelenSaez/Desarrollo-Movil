import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
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

const Stack = createStackNavigator();

export default function Navigation() {
  const [user, setUser] = useState(undefined);
  // true = mostrar la pantalla de "login exitoso" antes de pasar a Home
  const [mostrarExito, setMostrarExito] = useState(false);
  // true = mostrar la pantalla de "registro exitoso" después de crear la cuenta
  // (Firebase inicia sesión al crear la cuenta; sin esto pasaría directo a Home)
  const [mostrarRegistroExito, setMostrarRegistroExito] = useState(false);

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

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los datos de tu proyecto.
        </Text>
      </View>
    );
  }

  if (user === undefined) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
            <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />

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
          </>
        ) : (
          <>
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

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { textAlign: 'center', fontSize: 16 },
});