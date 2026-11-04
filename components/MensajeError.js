// React: necesario para escribir JSX.
import React from 'react';
// View: contenedor. Text: texto. StyleSheet: estilos.
import { View, Text, StyleSheet } from 'react-native';
// FontAwesome: set de íconos (triángulo o círculo de advertencia).
import { FontAwesome } from '@expo/vector-icons';
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

// Mensaje de error reutilizable.
// tipo="campo" (por defecto): línea de error debajo de un campo
// tipo="banner": recuadro rojo de error general (login fallido)
export default function MensajeError({ mensaje, tipo = 'campo' }) {
  // Según el tipo cambian el estilo, el ícono y su tamaño
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

// Estilos de las dos variantes (campo y banner) y del texto en rojo.
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
    fontFamily: FUENTES.regular,
    color: '#e05252',
    fontSize: 14,
    marginLeft: 10,
  },
});