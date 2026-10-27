import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { useNotificacion } from '../components/Notificacion';

export default function Home({ navigation }) {
  const { mostrarNotificacion } = useNotificacion(); // avisos en pantalla (S3-08)

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      mostrarNotificacion('Sesión cerrada correctamente.', 'info');
      // El observador de Firebase muestra Login al cerrar la sesión.
    } catch (error) {
      mostrarNotificacion('Hubo un problema al cerrar sesión.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Bienvenido a la aplicación</Text>
      {/* Acceso a la pantalla de Equipos */}
      <TouchableOpacity
        style={[styles.button, styles.buttonEquipos]}
        onPress={() => navigation.navigate('ListadoEquipos')}
      >
        <Text style={styles.buttonText}>Equipos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: '85%',
    height: undefined,
    aspectRatio: 2170 / 725, // proporción real de assets/logo.png (si no, se recorta)
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#922b21',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonEquipos: {
    backgroundColor: '#4e7246',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

