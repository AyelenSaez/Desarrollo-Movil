// React: necesario para escribir JSX.
import React from 'react';
// Modal: ventana que se muestra encima de la pantalla actual.
// View/Text: contenedor y texto. TouchableOpacity: botón.
// Pressable: zona tocable (acá se usa para el fondo y la tarjeta). StyleSheet: estilos.
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
// Ionicons: set de íconos (acá se usa la puerta de salida "log-out-outline").
import { Ionicons } from '@expo/vector-icons';
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

// S7-06 — Mensaje de confirmación «¿Desea cerrar su sesión?».
// Mismo diseño que MensajeConfirmarEliminacion (fondo gris translúcido, tarjeta blanca
// y dos botones): Cancelar en verde y Cerrar sesión con borde rojo.
//
// Uso:
//   <MensajeCerrarSesion
//     visible={mostrar}
//     cerrando={false}                    // true mientras se cierra la sesión (bloquea los botones)
//     onCancelar={() => setMostrar(false)}
//     onConfirmar={cerrarLaSesion}
//   />

// Colores de Figma (los mismos que usan el resto de las pantallas)
const COLORS = {
  fondo: 'rgba(214, 214, 216, 0.6)', // velo gris que cubre la pantalla
  blanco: '#FFFFFF',
  rosa: '#fce3e3',                   // círculo detrás del ícono
  rojo: '#a32d2d',                   // ícono y botón Cerrar sesión
  verde: '#4e7246',                  // botón Cancelar (verde de la app)
  titulo: '#042a54',
  mensaje: '#334b27',
};

// Componente del cartel «¿Desea cerrar su sesión?». Ver "Uso" arriba para las props.
export default function MensajeCerrarSesion({ visible, cerrando = false, onCancelar, onConfirmar }) {
  // Mientras se cierra la sesión no se puede cancelar: ya está en marcha
  const cancelar = () => {
    if (!cerrando) onCancelar();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={cancelar} // botón "atrás" de Android
    >
      {/* Tocar el fondo cierra el mensaje */}
      <Pressable style={styles.fondo} onPress={cancelar}>
        {/* Este Pressable evita que tocar la tarjeta se cuente como tocar el fondo */}
        <Pressable style={styles.tarjeta} onPress={() => {}} accessibilityViewIsModal>
          {/* Círculo rosa con el ícono de salida */}
          <View style={styles.circulo}>
            <Ionicons name="log-out-outline" size={30} color={COLORS.rojo} />
          </View>

          <Text style={styles.titulo}>¿Desea cerrar su sesión?</Text>
          <Text style={styles.mensaje}>
            Para volver a entrar vas a tener que{'\n'}ingresar tu correo y contraseña.
          </Text>

          <View style={styles.botones}>
            {/* Cancelar: verde, cierra el mensaje sin hacer nada */}
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar, cerrando && styles.botonDeshabilitado]}
              onPress={cancelar}
              disabled={cerrando}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>

            {/* Cerrar sesión: fondo blanco con borde rojo */}
            <TouchableOpacity
              style={[styles.boton, styles.botonCerrar, cerrando && styles.botonDeshabilitado]}
              onPress={onConfirmar}
              disabled={cerrando}
            >
              <Text style={styles.textoCerrar}>{cerrando ? 'Cerrando...' : 'Cerrar sesión'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Estilos del fondo gris, la tarjeta blanca, el círculo rosa y los dos botones.
const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: COLORS.fondo,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.blanco,
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    // sombra para que se distinga del fondo
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  circulo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.rosa,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontFamily: FUENTES.bold,
    fontSize: 20,
    color: COLORS.titulo,
    textAlign: 'center',
    marginBottom: 10,
  },
  mensaje: {
    fontFamily: FUENTES.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.mensaje,
    textAlign: 'center',
    marginBottom: 24,
  },
  botones: {
    flexDirection: 'row',
    width: '100%',
  },
  boton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: COLORS.verde,
    marginRight: 12,
  },
  botonCerrar: {
    backgroundColor: COLORS.blanco,
    borderWidth: 1,
    borderColor: COLORS.rojo,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoCancelar: {
    fontFamily: FUENTES.semibold,
    color: COLORS.blanco,
    fontSize: 15,
  },
  textoCerrar: {
    fontFamily: FUENTES.semibold,
    color: COLORS.rojo,
    fontSize: 15,
  },
});
