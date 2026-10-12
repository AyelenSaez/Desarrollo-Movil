import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import CampoTexto from './CampoTexto';
import { colors } from '../src/theme/colors';

// CampoTexto con candado y ojo. Cada CampoContrasena guarda su propio estado,
// así el ojo de "Contraseña" y el de "Confirmar contraseña" funcionan por separado.
export default function CampoContrasena(props) {
  const [mostrar, setMostrar] = useState(false); // true = contraseña visible

  return (
    <CampoTexto
      icono="lock"
      secureTextEntry={!mostrar}   // oculta los caracteres si mostrar es false
      autoCapitalize="none"
      autoCorrect={false}
      accesorio={
        // Botón del ojo: ojo abierto = se ve la contraseña, ojo tachado = oculta (como en el Figma)
        <TouchableOpacity
          onPress={() => setMostrar(!mostrar)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} // agranda el área táctil
          accessibilityRole="button"
          accessibilityLabel={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <FontAwesome name={mostrar ? 'eye' : 'eye-slash'} size={20} color={colors.title} />
        </TouchableOpacity>
      }
      {...props}
    />
  );
}
