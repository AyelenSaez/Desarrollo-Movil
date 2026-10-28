import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
 
// Mensaje de confirmación previo a eliminar un equipo (S5-10, fiel a Figma).
// Se muestra encima de la pantalla con un fondo gris translúcido y dos botones.
//
// Uso:
//   <MensajeConfirmarEliminacion
//     visible={mostrar}
//     nombre="Parlante JBL 15"
//     eliminando={false}                  // true mientras se espera la respuesta (bloquea los botones)
//     onCancelar={() => setMostrar(false)}
//     onConfirmar={eliminar}
//   />
 
// Colores medidos del diseño de Figma
const COLORS = {
  fondo: 'rgba(214, 214, 216, 0.6)', // velo gris que cubre la pantalla
  blanco: '#FFFFFF',
  rosa: '#fce3e3',                   // círculo detrás de la papelera
  rojo: '#a32d2d',                   // papelera y botón Eliminar
  titulo: '#042a54',
  mensaje: '#334b27',
  cancelarTexto: '#6e6d6d',
  cancelarBorde: '#bdbdbd',
};
 
export default function MensajeConfirmarEliminacion({
  visible,
  nombre,
  eliminando = false,
  onCancelar,
  onConfirmar,
}) {
  // Mientras se elimina no se puede cancelar: el borrado ya está en marcha
  const cancelar = () => {
    if (!eliminando) onCancelar();
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
          {/* Círculo rosa con la papelera */}
          <View style={styles.circulo}>
            <Ionicons name="trash-outline" size={30} color={COLORS.rojo} />
          </View>
 
          <Text style={styles.titulo}>¿Eliminar este equipo?</Text>
          <Text style={styles.mensaje}>
            “{nombre}” se va a borrar del inventario.{'\n'}Esta acción no se puede deshacer.
          </Text>
 
          <View style={styles.botones}>
            <TouchableOpacity
              style={[styles.boton, styles.botonCancelar]}
              onPress={cancelar}
              disabled={eliminando}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
 
            <TouchableOpacity
              style={[styles.boton, styles.botonEliminar, eliminando && styles.botonDeshabilitado]}
              onPress={onConfirmar}
              disabled={eliminando}
            >
              <Text style={styles.textoEliminar}>{eliminando ? 'Eliminando...' : 'Eliminar'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
 
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.titulo,
    textAlign: 'center',
    marginBottom: 10,
  },
  mensaje: {
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
    backgroundColor: COLORS.blanco,
    borderWidth: 1,
    borderColor: COLORS.cancelarBorde,
    marginRight: 12,
  },
  botonEliminar: {
    backgroundColor: COLORS.rojo,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoCancelar: {
    color: COLORS.cancelarTexto,
    fontSize: 15,
  },
  textoEliminar: {
    color: COLORS.blanco,
    fontSize: 15,
    fontWeight: '600',
  },
});