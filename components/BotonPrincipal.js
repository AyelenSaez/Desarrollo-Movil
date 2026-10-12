import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/theme/colors';

// Botón verde del Figma (Registrarse, Iniciar sesión, etc.).
// cargando: muestra un spinner y no deja tocar el botón (evita enviar dos veces)
export default function BotonPrincipal({ titulo, onPress, cargando = false }) {
  return (
    <TouchableOpacity
      style={[styles.button, cargando && styles.buttonCargando]}
      onPress={onPress}
      disabled={cargando}
      accessibilityRole="button"
      accessibilityState={{ disabled: cargando, busy: cargando }}
    >
      {cargando ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{titulo}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 70,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 17,
  },
  buttonCargando: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: 'bold',
  },
});
