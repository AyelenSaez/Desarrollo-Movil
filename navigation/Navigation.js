import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import LoginExitoso from '../screens/LoginExitoso';

const Stack = createStackNavigator();

export default function Navigation() {
  const [user, setUser] = useState(undefined);
  // true = mostrar la pantalla de "login exitoso" antes de pasar a Home
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

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
        ) : user ? (
          <Stack.Screen name="Home" component={Home} options={{ title: 'Inicio' }} />
        ) : (
          <>
            <Stack.Screen name="Login" options={{ title: 'Iniciar sesión' }}>
              {(props) => <Login {...props} setMostrarExito={setMostrarExito} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Registro' }} />
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
