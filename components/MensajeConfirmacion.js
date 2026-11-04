// React: necesario para escribir JSX.
import React from 'react';
// View: contenedor. Text: texto. TouchableOpacity: botón que se opaca al tocarlo.
// StyleSheet: crear los estilos.
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// FontAwesome: set de íconos (acá se usa el ícono de "check" ✓).
import { FontAwesome } from '@expo/vector-icons';
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

// Componente reutilizable de confirmación (login exitoso, registro exitoso, etc.)
// Props: titulo y mensaje (textos a mostrar), textoBoton (texto del botón)
// y onPress (función que se ejecuta al tocar el botón).
export default function MensajeConfirmacion({ titulo, mensaje, textoBoton, onPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.circle}>
          <FontAwesome name="check" size={44} color="#fff" />
        </View>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.message}>{mensaje}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{textoBoton}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos: círculo azul con el check, título, mensaje y botón verde abajo.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0b2f5b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FUENTES.bold,
    fontSize: 24,
    color: '#0b2f5b',
    marginTop: 24,
  },
  message: {
    fontFamily: FUENTES.regular,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4e7246',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FUENTES.bold,
    color: '#fff',
    fontSize: 16,
  },
});