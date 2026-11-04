// React y sus hooks:
// createContext: crea un "contexto" para compartir datos con todas las pantallas.
// useCallback: memoriza una función para no recrearla en cada render.
// useContext: lee un contexto desde un componente.
// useEffect: ejecuta código al montar/desmontar el componente.
// useMemo: memoriza un valor calculado.
// useRef: guarda un valor que persiste entre renders sin volver a dibujar.
// useState: guarda un valor que, al cambiar, vuelve a dibujar el componente.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// Animated: animaciones (aparecer/desaparecer). View/Text: contenedor y texto. StyleSheet: estilos.
import { Animated, View, Text, StyleSheet } from 'react-native';
// FontAwesome: íconos del aviso (check, info, exclamación).
import { FontAwesome } from '@expo/vector-icons';
// useSafeAreaInsets: devuelve los márgenes seguros (barra de estado, notch) para no tapar el aviso.
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';

// Notificaciones en pantalla (S3-08).
// Un aviso que aparece arriba y se oculta solo. Se usa desde cualquier pantalla:
//   const { mostrarNotificacion } = useNotificacion();
//   mostrarNotificacion('Sesión cerrada correctamente.', 'info');
// Tipos: 'exito' (verde), 'info' (azul) y 'error' (rojo).

// Ícono y color de cada tipo de aviso
const TIPOS = {
  exito: { icono: 'check-circle', color: '#4e7246' },
  info: { icono: 'info-circle', color: '#042a54' },
  error: { icono: 'exclamation-circle', color: '#d64545' },
};

const DURACION = 3000; // milisegundos que queda visible

// Contexto que comparte la función mostrarNotificacion con toda la app.
// El valor por defecto (función vacía) evita errores si se usa fuera del Provider.
const NotificacionContext = createContext({ mostrarNotificacion: () => {} });

// Envuelve la app (en App.js) para que todas las pantallas puedan mostrar avisos
export function NotificacionProvider({ children }) {
  const [notificacion, setNotificacion] = useState(null); // { mensaje, tipo } o null
  const opacidad = useRef(new Animated.Value(0)).current;  // 0 = invisible, 1 = visible
  const temporizador = useRef(null);
  const insets = useSafeAreaInsets(); // espacio de la barra de estado / notch

  // Oculta el aviso con una animación de desvanecimiento (opacidad 1 -> 0)
  const ocultar = useCallback(() => {
    Animated.timing(opacidad, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      // si mientras se ocultaba llegó otro aviso, la animación se corta y no se borra
      if (finished) setNotificacion(null);
    });
  }, [opacidad]);

  // Muestra un aviso con animación (opacidad 0 -> 1) y programa que se oculte tras DURACION
  const mostrarNotificacion = useCallback((mensaje, tipo = 'exito') => {
    clearTimeout(temporizador.current); // si había otro aviso, lo reemplaza
    setNotificacion({ mensaje, tipo });
    Animated.timing(opacidad, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    temporizador.current = setTimeout(ocultar, DURACION);
  }, [opacidad, ocultar]);

  // Al cerrar la app, cancela el temporizador pendiente
  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Valor que reciben las pantallas al usar useNotificacion()
  const valor = useMemo(() => ({ mostrarNotificacion }), [mostrarNotificacion]);
  // Ícono y color según el tipo del aviso actual (por defecto, éxito)
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

// Estilos: el aviso flota arriba de la pantalla (posición absoluta) con borde de color a la izquierda.
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
    fontFamily: FUENTES.regular,
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#05284c',
  },
});
