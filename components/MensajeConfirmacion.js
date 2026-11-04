import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Componente reutilizable de confirmación (login exitoso, registro exitoso, etc.)
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b2f5b',
    marginTop: 24,
  },
  message: {
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});