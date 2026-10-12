import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MensajeError from './MensajeError';
import { colors } from '../src/theme/colors';

// Checkbox reutilizable (por ejemplo, "Acepto los Términos y Condiciones").
// Toda la fila se puede tocar, no solo el cuadradito.
// marcado: true/false | onCambiar: recibe el valor nuevo | children: el texto de la derecha
export default function CasillaVerificacion({ marcado, onCambiar, error, children }) {
  return (
    <View>
      <TouchableOpacity
        style={styles.fila}
        onPress={() => onCambiar(!marcado)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcado }}
      >
        <FontAwesome
          name={marcado ? 'check-square' : 'square-o'}   // tildado o vacío según el estado
          size={22}
          color={marcado ? colors.title : error ? colors.error : colors.text}
        />
        <View style={styles.texto}>{children}</View>
      </TouchableOpacity>

      {/* Mensaje de error (solo aparece si no se aceptaron los términos) */}
      {error && <MensajeError mensaje={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 20, // MensajeError usa marginTop: -14 contando con este espacio
  },
  texto: {
    marginLeft: 8,
    flexShrink: 1,
  },
});
