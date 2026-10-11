import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Colores del diseño en Figma (Infinito Sonido e Iluminación)
const COLORES = {
  azulTitulo: '#042A54',
  azulTexto: '#05284C',
  verdeBoton: '#4E7246',
  rojoError: '#D64545',
  rojoFondo: 'rgba(214, 69, 69, 0.1)',
  blanco: '#FFFFFF',
};

/**
 * Pantalla de registro fallido (S3-06).
 * Sigue la estructura de "Registro exitoso" del Figma (círculo con ícono,
 * título, mensaje y botón verde) con la caja de error de "Login - credenciales inválidas".
 *
 * Parámetros de navegación:
 *  - mensaje: texto ya traducido (traducirErrorFirebase)
 *  - codigo:  código de Firebase, ej. 'auth/email-already-in-use'
 */
export default function RegistroFallido({ route, navigation }) {
  const { mensaje, codigo } = route?.params ?? {};
  const correoYaRegistrado = codigo === 'auth/email-already-in-use';

  return (
    <View style={styles.container}>
      <View style={styles.contenido}>
        <View style={styles.circulo}>
          <FontAwesome name="times" size={60} color={COLORES.blanco} />
        </View>

        <Text style={styles.titulo}>No pudimos crear tu cuenta</Text>

        <View style={styles.cajaError}>
          <FontAwesome name="exclamation-triangle" size={20} color={COLORES.rojoError} />
          <Text style={styles.textoError}>
            {mensaje ?? 'Hubo un problema al registrar el usuario. Intentá de nuevo.'}
          </Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.boton} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBoton}>Intentar de nuevo</Text>
        </TouchableOpacity>

        {correoYaRegistrado && (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.enlace}>
              ¿Ya tienes una cuenta? <Text style={styles.enlaceNegrita}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORES.blanco,
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circulo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORES.rojoError,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORES.azulTitulo,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 24,
  },
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 18,
    borderWidth: 1,
    borderColor: COLORES.rojoError,
    borderRadius: 10,
    backgroundColor: COLORES.rojoFondo,
  },
  textoError: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    color: COLORES.rojoError,
  },
  acciones: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  boton: {
    width: '100%',
    height: 64,
    borderRadius: 10,
    backgroundColor: COLORES.verdeBoton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    color: COLORES.blanco,
    fontSize: 24,
    fontWeight: 'bold',
  },
  enlace: {
    marginTop: 18,
    fontSize: 18,
    color: '#000000',
  },
  enlaceNegrita: {
    fontWeight: 'bold',
    color: COLORES.azulTitulo,
  },
});