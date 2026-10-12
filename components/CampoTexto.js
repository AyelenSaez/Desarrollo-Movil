import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MensajeError from './MensajeError';
import { colors } from '../src/theme/colors';

// Campo de texto reutilizable con el diseño del Figma (caja con borde).
// etiqueta: texto de arriba | obligatorio: agrega el * rojo
// icono: nombre de FontAwesome (opcional) | error: mensaje debajo del campo
// accesorio: algo para mostrar a la derecha (por ejemplo, el ojo de la contraseña)
// El resto de las props (value, onChangeText, keyboardType...) van directo al TextInput.
export default function CampoTexto({
  etiqueta, obligatorio = false, icono, error, accesorio, inputRef, style, ...inputProps
}) {
  return (
    <View style={style}>
      <Text style={styles.label}>
        {etiqueta}
        {obligatorio && <Text style={styles.asterisk}> *</Text>}
      </Text>

      {/* Caja del campo: el borde se pone rojo si hay error */}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icono && (
          <FontAwesome name={icono} size={20} color={error ? colors.error : colors.title} style={styles.icon} />
        )}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={etiqueta}
          {...inputProps}
        />
        {accesorio}
      </View>

      {/* Mensaje de error (solo aparece si hay error) */}
      {error && <MensajeError mensaje={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 20,
    color: colors.label,
    marginBottom: 6,
  },
  asterisk: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 17,
    marginBottom: 20, // MensajeError usa marginTop: -14 contando con este espacio
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 20,
    color: colors.text,
  },
});
