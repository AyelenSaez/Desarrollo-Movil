import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../src/theme/colors';

// Requisitos de la contraseña según el Figma.
// Se usan para pintar la lista y también en el esquema de zod de SignUp,
// así la lista y la validación piden siempre lo mismo.
export const evaluarRequisitos = (contrasena) => [
  { texto: 'Mínimo 8 caracteres', cumple: contrasena.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: /[A-Z]/.test(contrasena) },
  { texto: 'Un número', cumple: /\d/.test(contrasena) },
  { texto: 'Un carácter especial (!@#$)', cumple: /[^A-Za-z0-9\s]/.test(contrasena) },
];

// Caja "Tu contraseña debe tener:" que aparece debajo del campo Contraseña
export default function RequisitosContrasena({ contrasena }) {
  const vacia = contrasena.length === 0;

  return (
    <View style={styles.caja}>
      <Text style={[styles.titulo, !vacia && styles.tituloActivo]}>Tu contraseña debe tener:</Text>

      {evaluarRequisitos(contrasena).map((requisito) => {
        // Vacía: gris. Escribiendo: verde si cumple, rojo si no.
        const color = vacia ? colors.muted : requisito.cumple ? colors.success : colors.error;
        const icono = vacia ? 'circle-o' : requisito.cumple ? 'check-circle-o' : 'times-circle-o';

        return (
          <View key={requisito.texto} style={styles.fila}>
            <FontAwesome name={icono} size={14} color={color} />
            <Text style={[styles.item, { color }]}>{requisito.texto}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: colors.hintBox,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: -12,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  tituloActivo: {
    color: colors.success,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  item: {
    fontSize: 11,
    marginLeft: 6,
  },
});
