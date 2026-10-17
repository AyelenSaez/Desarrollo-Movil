import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Mismos colores que Login.js / SignUp.js
const COLORS = {
  azul: "#0b2f5b",
  verde: "#4e7246",
  blanco: "#FFFFFF",
};

// onIniciarSesion viene de Navigation.js: cierra la sesión que abrió
// Firebase al crear la cuenta y vuelve al Login.
export default function RegistroExitoso({ onIniciarSesion }) {
  return (
    <View style={styles.container}>
      <View style={styles.centro}>
        <View style={styles.circulo}>
          <Ionicons
            name="checkmark-circle-outline"
            size={48}
            color={COLORS.blanco}
          />
        </View>

        <Text style={styles.titulo}>¡Cuenta creada!</Text>
        <Text style={styles.texto}>
          Ya podés iniciar sesión con tu correo y contraseña.
        </Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={onIniciarSesion}>
        <Text style={styles.botonTexto}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blanco,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circulo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.azul,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.azul,
    marginBottom: 8,
  },
  texto: {
    fontSize: 15,
    color: COLORS.azul,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  boton: {
    backgroundColor: COLORS.verde,
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: {
    color: COLORS.blanco,
    fontSize: 16,
    fontWeight: "700",
  },
});