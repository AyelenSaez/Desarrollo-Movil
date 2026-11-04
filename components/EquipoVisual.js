// Piezas visuales de los equipos que comparten el Listado y el Detalle (fieles a Figma):
// colores, ícono según el tipo y etiquetas de tipo y estado.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// MaterialCommunityIcons tiene los íconos de Figma (ondas de sonido, lamparita, consola)
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FUENTES } from '../src/theme/fuentes';

// Colores medidos del diseño de Figma (pantallas de Equipos)
export const COLORES_EQUIPO = {
  azul: '#042a54',         // títulos, botones principales
  azulLabel: '#05284c',    // títulos de los campos
  texto: '#1e1e1e',        // texto dentro de los campos
  gris: 'rgba(21,21,21,0.64)', // textos secundarios (tipo, "2 equipos")
  borde: 'rgba(30,30,30,0.45)', // borde de los campos
  separador: '#e5e5e5',    // línea entre equipos del listado
  fondo: '#fdfdfe',
  blanco: '#FFFFFF',
  verde: '#4e7246',        // avatar del usuario
  verdeClaro: '#89b181',   // ondas de sonido sobre fondo azul
  celeste: '#d8eafe',      // fondo de los botones ver/editar
  rosa: '#ffdbd6',         // fondo del botón eliminar
  rojo: '#a32d2d',
};

// Ícono y colores de cada tipo de equipo
const TIPOS = {
  Sonido: { icono: 'waveform', color: COLORES_EQUIPO.azul, fondo: '#d8eafe', etiqueta: '#c2c7f5', etiquetaTexto: '#002a41' },
  Iluminación: { icono: 'lightbulb-on-outline', color: '#c47f17', fondo: '#feeac7', etiqueta: '#fdeac9', etiquetaTexto: '#3c2601' },
  Infraestructura: { icono: 'tune-vertical-variant', color: COLORES_EQUIPO.azul, fondo: '#d8eafe', etiqueta: '#e4e4e7', etiquetaTexto: '#3f3f46' },
};
const TIPO_DESCONOCIDO = { icono: 'cube-outline', color: COLORES_EQUIPO.azul, fondo: '#d8eafe', etiqueta: '#e4e4e7', etiquetaTexto: '#3f3f46' };

// Colores de la etiqueta de cada estado
const ESTADOS = {
  Disponible: { fondo: '#daf6d0', texto: '#334b27' },
  'En uso': { fondo: '#d8eafe', texto: COLORES_EQUIPO.azul },
  'En reparación': { fondo: '#fdeac9', texto: '#3c2601' },
  'Fuera de servicio': { fondo: '#ffdbd6', texto: COLORES_EQUIPO.rojo },
};
const ESTADO_DESCONOCIDO = { fondo: '#e4e4e7', texto: '#3f3f46' };

const datosTipo = (tipo) => TIPOS[tipo] ?? TIPO_DESCONOCIDO;

// Cuadrado de color con el ícono del tipo.
// destacado = fondo azul con ícono verde (como en el Detalle de Figma)
export function IconoTipo({ tipo, tamaño = 'chico', destacado = false }) {
  const t = datosTipo(tipo);
  const grande = tamaño === 'grande';
  return (
    <View
      style={[
        grande ? styles.iconoGrande : styles.iconoChico,
        { backgroundColor: destacado ? COLORES_EQUIPO.azul : t.fondo },
      ]}
    >
      <MaterialCommunityIcons
        name={t.icono}
        size={grande ? 44 : 32}
        color={destacado ? COLORES_EQUIPO.verdeClaro : t.color}
      />
    </View>
  );
}

// Etiqueta redondeada con el estado (Disponible, En reparación...)
export function EtiquetaEstado({ estado }) {
  const e = ESTADOS[estado] ?? ESTADO_DESCONOCIDO;
  return (
    <View style={[styles.etiqueta, { backgroundColor: e.fondo }]}>
      <Text style={[styles.etiquetaTexto, { color: e.texto }]}>{estado}</Text>
    </View>
  );
}

// Etiqueta redondeada con el tipo (Sonido, Iluminación...)
export function EtiquetaTipo({ tipo }) {
  const t = datosTipo(tipo);
  return (
    <View style={[styles.etiqueta, { backgroundColor: t.etiqueta }]}>
      <Text style={[styles.etiquetaTexto, { color: t.etiquetaTexto }]}>{tipo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconoChico: {
    width: 59,
    height: 55,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoGrande: {
    width: 70,
    height: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiqueta: {
    alignSelf: 'flex-start',
    minWidth: 91,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 1,
    alignItems: 'center',
  },
  etiquetaTexto: { fontFamily: FUENTES.regular, fontSize: 12 },
});
