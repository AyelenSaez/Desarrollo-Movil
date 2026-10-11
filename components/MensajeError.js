import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Mensaje de error reutilizable.
// tipo="campo" (por defecto): línea de error debajo de un campo
// tipo="banner": recuadro rojo de error general (login fallido)
export default function MensajeError({ mensaje, tipo = 'campo' }) {
  const esBanner = tipo === 'banner';

  return (
    <View style={esBanner ? styles.banner : styles.campo}>
      <FontAwesome
        name={esBanner ? 'exclamation-triangle' : 'exclamation-circle'}
        size={esBanner ? 16 : 15}
        color="#e05252"
      />
      <Text style={[styles.texto, esBanner && { flex: 1 }]}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -14,
    marginBottom: 15,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fdecec',
    borderColor: '#e05252',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  texto: {
    color: '#e05252',
    fontSize: 14,
    marginLeft: 10,
  },
});