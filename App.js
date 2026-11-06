// Componente raíz de la aplicación. Envuelve la navegación con los "proveedores"
// (providers) que necesitan estar disponibles en todas las pantallas.

// React: necesario para poder escribir JSX (las etiquetas tipo <View>).
import React from 'react';
// react-native-gesture-handler: maneja los gestos táctiles (deslizar para volver, etc.).
// React Navigation lo necesita y debe importarse lo antes posible.
import 'react-native-gesture-handler';
// SafeAreaProvider: calcula los márgenes seguros de la pantalla (notch, barra de estado).
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Navigation: componente que decide qué pantallas mostrar (login, home, etc.).
import Navigation from './navigation/Navigation';
// NotificacionProvider: permite mostrar avisos flotantes desde cualquier pantalla.
import { NotificacionProvider } from './components/Notificacion';
// useFonts: carga la fuente Work Sans antes de mostrar la app.
import { useFonts } from 'expo-font';
import { ARCHIVOS_FUENTES } from './src/theme/fuentes';

// App: arma la estructura base de la app y la devuelve para que Expo la dibuje.
export default function App() {
  // Hasta que no carga la fuente no se dibuja nada (si no, el texto "salta" de fuente).
  // Si la fuente falla (errorFuentes), la app arranca igual con la fuente del sistema.
  const [fuentesCargadas, errorFuentes] = useFonts(ARCHIVOS_FUENTES);
  if (!fuentesCargadas && !errorFuentes) return null;

  return (
    // SafeAreaProvider: da el espacio de la barra de estado a las notificaciones
    // NotificacionProvider: permite mostrar avisos en pantalla desde cualquier pantalla (S3-08)
    <SafeAreaProvider>
      <NotificacionProvider>
        <Navigation />
      </NotificacionProvider>
    </SafeAreaProvider>
  );
}
