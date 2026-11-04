// React: necesario para escribir JSX.
import React from "react";
// View: contenedor. Text: texto. TouchableOpacity: botón. StyleSheet: estilos.
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Ionicons: set de íconos (acá se usa el check dentro del círculo).
import { Ionicons } from "@expo/vector-icons";
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

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

// Estilos: contenido centrado (círculo, título y texto) y botón verde abajo.
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
    fontFamily: FUENTES.bold,
    fontSize: 22,
    color: COLORS.azul,
    marginBottom: 8,
  },
  texto: {
    fontFamily: FUENTES.regular,
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
    fontFamily: FUENTES.bold,
    color: COLORS.blanco,
    fontSize: 16,
  },
});