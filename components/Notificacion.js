import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Notificaciones en pantalla (S3-08).
// Un aviso que aparece arriba y se oculta solo. Se usa desde cualquier pantalla:
//   const { mostrarNotificacion } = useNotificacion();
//   mostrarNotificacion('Sesión cerrada correctamente.', 'info');
// Tipos: 'exito' (verde), 'info' (azul) y 'error' (rojo).

const TIPOS = {
  exito: { icono: 'check-circle', color: '#4e7246' },
  info: { icono: 'info-circle', color: '#042a54' },
  error: { icono: 'exclamation-circle', color: '#d64545' },
};

const DURACION = 3000; // milisegundos que queda visible

const NotificacionContext = createContext({ mostrarNotificacion: () => {} });

// Envuelve la app (en App.js) para que todas las pantallas puedan mostrar avisos
export function NotificacionProvider({ children }) {
  const [notificacion, setNotificacion] = useState(null); // { mensaje, tipo } o null
  const opacidad = useRef(new Animated.Value(0)).current;  // 0 = invisible, 1 = visible
  const temporizador = useRef(null);
  const insets = useSafeAreaInsets(); // espacio de la barra de estado / notch

  const ocultar = useCallback(() => {
    Animated.timing(opacidad, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      // si mientras se ocultaba llegó otro aviso, la animación se corta y no se borra
      if (finished) setNotificacion(null);
    });
  }, [opacidad]);

  const mostrarNotificacion = useCallback((mensaje, tipo = 'exito') => {
    clearTimeout(temporizador.current); // si había otro aviso, lo reemplaza
    setNotificacion({ mensaje, tipo });
    Animated.timing(opacidad, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    temporizador.current = setTimeout(ocultar, DURACION);
  }, [opacidad, ocultar]);

  // Al cerrar la app, cancela el temporizador pendiente
  useEffect(() => () => clearTimeout(temporizador.current), []);

  const valor = useMemo(() => ({ mostrarNotificacion }), [mostrarNotificacion]);
  const estilo = TIPOS[notificacion?.tipo] ?? TIPOS.exito;

  return (
    <NotificacionContext.Provider value={valor}>
      <View style={styles.contenedor}>
        {children}

        {notificacion && (
          <Animated.View
            pointerEvents="none"                 // no bloquea los toques de la pantalla
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"     // el lector de pantalla lo anuncia
            style={[styles.aviso, { top: insets.top + 10, opacity: opacidad, borderLeftColor: estilo.color }]}
          >
            <FontAwesome name={estilo.icono} size={20} color={estilo.color} />
            <Text style={styles.texto}>{notificacion.mensaje}</Text>
          </Animated.View>
        )}
      </View>
    </NotificacionContext.Provider>
  );
}

// Hook para usar las notificaciones desde una pantalla
export const useNotificacion = () => useContext(NotificacionContext);

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  aviso: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    // sombra para que se distinga del fondo
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  texto: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#05284c',
  },
});
