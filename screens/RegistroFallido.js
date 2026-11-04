// React: necesario para escribir JSX.
import React from 'react';
// View: contenedor. Text: texto. TouchableOpacity: botón. StyleSheet: estilos.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// FontAwesome: íconos (cruz "times" y triángulo de advertencia).
import { FontAwesome } from '@expo/vector-icons';
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

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
  // Lee los parámetros que mandó SignUp al navegar a esta pantalla
  const { mensaje, codigo } = route?.params ?? {};
  // Si el correo ya existe, se ofrece además el enlace para ir al Login
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
        {/* Vuelve al formulario de registro para intentar de nuevo */}
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

// Estilos: círculo rojo, título, caja de error y botón verde.
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
    fontFamily: FUENTES.bold,
    fontSize: 30,
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
    fontFamily: FUENTES.regular,
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
    fontFamily: FUENTES.bold,
    color: COLORES.blanco,
    fontSize: 24,
  },
  enlace: {
    fontFamily: FUENTES.regular,
    marginTop: 18,
    fontSize: 18,
    color: '#000000',
  },
  enlaceNegrita: {
    fontFamily: FUENTES.bold,
    color: COLORES.azulTitulo,
  },
});