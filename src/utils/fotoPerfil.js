// Foto de perfil del usuario (S7-07): se guarda en el teléfono con AsyncStorage
// y la muestran Mi perfil, el menú ☰ del Inicio y el encabezado de Equipos.
//
// Uso en una pantalla:
//   const [fotoPerfil, setFotoPerfil] = useFotoPerfil();
//   {fotoPerfil ? <Image source={{ uri: fotoPerfil }} ... /> : <Text>{inicial}</Text>}

// useCallback/useState: hooks de React. useFocusEffect: vuelve a leer la foto
// cada vez que la pantalla se muestra (por ejemplo, al volver de Mi perfil).
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
// AsyncStorage: almacenamiento del teléfono (la foto sigue ahí aunque se cierre la app).
import AsyncStorage from '@react-native-async-storage/async-storage';
// auth: usuario con sesión iniciada (cada usuario tiene su propia foto).
import { auth } from '../config/firebaseConfig';

// Clave con la que se guarda la foto de cada usuario
const claveFoto = () => `fotoPerfil_${auth.currentUser?.uid ?? 'sin-sesion'}`;

// Guarda la dirección (uri) de la foto elegida para el usuario actual.
export async function guardarFotoPerfil(uri) {
  try {
    await AsyncStorage.setItem(claveFoto(), uri);
  } catch (error) {
    console.log('No se pudo guardar la foto de perfil:', error);
  }
}

// Hook: devuelve [foto, setFoto]. foto es la uri guardada o null si no eligió ninguna.
export function useFotoPerfil() {
  const [foto, setFoto] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true; // evita actualizar la pantalla si ya se cerró
      AsyncStorage.getItem(claveFoto())
        .then((uri) => {
          if (activo) setFoto(uri);
        })
        .catch((error) => console.log('No se pudo leer la foto de perfil:', error));
      return () => {
        activo = false;
      };
    }, [])
  );

  return [foto, setFoto];
}
