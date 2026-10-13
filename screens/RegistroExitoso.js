import React from 'react';
import MensajeConfirmacion from '../components/MensajeConfirmacion';

// Pantalla de registro exitoso (S3-05).
// Textos del frame "Registro exitoso" del Figma. Reutiliza MensajeConfirmacion, igual que LoginExitoso.
export default function RegistroExitoso({ navigation }) {
  return (
    <MensajeConfirmacion
      titulo="¡Cuenta creada!"
      mensaje="Ya podés iniciar sesión con tu correo y contraseña."
      textoBoton="Iniciar sesión"
      onPress={() => navigation.navigate('Login')} // vuelve al Login
    />
  );
}
