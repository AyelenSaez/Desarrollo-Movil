import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  azul: '#0b2f5b',
  icono: '#6B7280',
  blanco: '#FFFFFF',
};

// ---------------------------------------------------------------
// PANTALLA: modificar un equipo.
// Recibe el id del equipo desde ListadoEquipos en route.params.idEquipo.
// Por ahora solo tiene la ruta y el botón de volver;
// el formulario de modificación se conecta después.
// ---------------------------------------------------------------
export default function ModificarEquipo({ navigation, route }) {
  const { idEquipo } = route.params ?? {};

  return (
    <View style={styles.flex}>
      {/* Flecha para volver: queda fija arriba a la izquierda */}
      <TouchableOpacity
        style={styles.flecha}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.azul} />
      </TouchableOpacity>

      <View style={styles.contenido}>
        <Text style={styles.titulo}>Modificar equipo</Text>
        <Text style={styles.texto}>Equipo: {idEquipo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.blanco },
  flecha: { position: 'absolute', top: 40, left: 20, zIndex: 1 },
  contenido: { paddingHorizontal: 20, paddingTop: 80 },
  titulo: { fontSize: 22, fontWeight: '700', color: COLORS.azul, marginBottom: 20 },
  texto: { fontSize: 15, color: COLORS.icono },
});
