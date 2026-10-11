import React from 'react';
import MensajeConfirmacion from '../components/MensajeConfirmacion';

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