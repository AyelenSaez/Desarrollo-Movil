// React: necesario para escribir JSX.
import React from 'react';
// MensajeConfirmacion: componente reutilizable con círculo, título, mensaje y botón.
import MensajeConfirmacion from '../components/MensajeConfirmacion';

// Pantalla que se muestra después de iniciar sesión correctamente.
// onContinuar viene de Navigation.js: oculta esta pantalla y pasa al Home.
export default function LoginExitoso({ onContinuar }) {
  return (
    <MensajeConfirmacion
      titulo="¡Bienvenido!"
      mensaje="Iniciaste sesión correctamente."
      textoBoton="Continuar"
      onPress={onContinuar}
    />
  );
}