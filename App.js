import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './navigation/Navigation';
import { NotificacionProvider } from './components/Notificacion';

export default function App() {
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
