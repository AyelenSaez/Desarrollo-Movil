// Visor de la foto de perfil a pantalla completa (fondo negro, foto grande y X para cerrar).
// Lo usan Mi perfil (al tocar la foto) y Editar perfil (opción "Ver foto").
//
// Uso:
//   <VisorFoto visible={verFoto} uri={fotoPerfil} onCerrar={() => setVerFoto(false)} />

import React from "react";
import {
  Modal,        // ventana que se abre arriba de la pantalla
  Pressable,    // fondo que se puede tocar para cerrar
  Image,        // la foto
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions, // ancho de la pantalla para que la foto ocupe todo el ancho
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VisorFoto({ visible, uri, onCerrar }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // la foto es cuadrada (se recorta 1:1 al elegirla), con un pequeño margen a los costados
  const lado = width - 32;

  return (
    <Modal
      visible={visible && !!uri}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCerrar} // botón "atrás" de Android
    >
      {/* fondo negro: tocarlo cierra el visor */}
      <Pressable style={styles.fondo} onPress={onCerrar}>
        {/* foto grande con esquinas redondeadas */}
        <Image
          source={{ uri }}
          style={{ width: lado, height: lado, borderRadius: 16 }}
          resizeMode="cover"
        />
      </Pressable>

      {/* X para cerrar, arriba a la derecha */}
      <TouchableOpacity
        style={[styles.cerrar, { top: insets.top + 12 }]}
        onPress={onCerrar}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Cerrar foto"
      >
        <Ionicons name="close" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  // botón redondo semitransparente con la X
  cerrar: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
