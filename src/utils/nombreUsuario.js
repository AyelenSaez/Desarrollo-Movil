// Nombre del usuario con sesión iniciada, leído de su documento en la
// colección "usuarios" de Firestore. Lo muestran el Inicio (saludo y menú ☰)
// y el encabezado de Equipos.
//
// Uso en una pantalla:
//   const nombre = useNombreUsuario();
//   const inicial = nombre.charAt(0).toUpperCase();

// useCallback/useState: hooks de React. useFocusEffect: vuelve a leer el nombre
// cada vez que la pantalla se muestra (por ejemplo, al volver de Editar perfil).
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
// auth: usuario con sesión iniciada (para el correo mientras carga o si falla).
import { auth } from '../config/firebaseConfig';
// obtenerPerfil: lee el perfil del usuario desde Firestore (S6-06).
import { obtenerPerfil } from '../services/perfilService';

// Mientras carga, o si no tiene nombre guardado, se usa la parte del correo antes del @
const nombrePorDefecto = () => auth.currentUser?.email?.split('@')[0] || 'Usuario';

// Hook: devuelve el nombre del usuario (el de Firestore, o el del correo si no hay).
export function useNombreUsuario() {
  const [nombre, setNombre] = useState(nombrePorDefecto);

  useFocusEffect(
    useCallback(() => {
      let activo = true; // evita actualizar la pantalla si ya se cerró
      obtenerPerfil().then((resultado) => {
        if (activo && resultado.ok && resultado.datos.nombre) {
          setNombre(resultado.datos.nombre);
        }
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  return nombre;
}
