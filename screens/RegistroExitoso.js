import React from 'react';
import MensajeConfirmacion from '../components/MensajeConfirmacion';

// Pantalla de registro exitoso.
// Textos del frame "Registro exitoso" del Figma. Reutiliza MensajeConfirmacion, igual que LoginExitoso.
// onIniciarSesion: lo pasa Navigation; cierra la sesión que abrió Firebase al crear la cuenta y vuelve al Login.
export default function RegistroExitoso({ onIniciarSesion }) {
  return (
    <MensajeConfirmacion
      titulo="¡Cuenta creada!"
      mensaje="Ya podés iniciar sesión con tu correo y contraseña."
      textoBoton="Iniciar sesión"
      onPress={onIniciarSesion}
    />
  );
}
