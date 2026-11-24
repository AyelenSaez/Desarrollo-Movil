// Pantalla de detalle de un equipo ("Detalle de equipo").
// Se abre desde el listado con el botón del ojo y permite ir a "Editar equipo".

// useCallback: memoriza la función de carga. useState: guarda el equipo, la carga y el error.
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
// margenes seguros (notch, barra de estado)
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// useFocusEffect: recarga el equipo cada vez que se vuelve a esta pantalla (después de editarlo)
import { useFocusEffect } from '@react-navigation/native';
import MensajeError from '../components/MensajeError';
// ícono y etiquetas de tipo y estado, iguales a los del listado
import { IconoTipo, EtiquetaTipo, EtiquetaEstado } from '../components/EquipoVisual';
// trae el equipo con los nombres de su tipo y estado
import { obtenerDetalleEquipo } from '../src/services/equipoService';
// mismos colores y estilos que los formularios de equipos
import { COLORS, styles as formStyles } from './RegistroEquipo';
import { FUENTES } from '../src/theme/fuentes';

// Pasa una fecha a texto dd/mm/aaaa (ej: 25/09/2026)
const formatearFecha = (fecha) =>
  fecha
    ? fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

// Fila de solo lectura: ícono, título y valor (mismo estilo que "Mi perfil").
// Si no hay valor, muestra el texto "vacio" en gris.
function Dato({ icono, label, valor, vacio = 'Sin completar', ultimo }) {
  return (
    <View style={[styles.dato, !ultimo && styles.datoSeparador]}>
      {/* ícono en un círculo celeste */}
      <View style={styles.datoIcono}>
        <Ionicons name={icono} size={18} color={COLORS.azul} />
      </View>
      <View style={styles.datoTextos}>
        <Text style={styles.datoLabel}>{label}</Text>
        <Text style={[styles.datoValor, !valor && styles.datoVacio]}>{valor || vacio}</Text>
      </View>
    </View>
  );
}

// "route" trae el ID del equipo que se tocó en el listado
export default function DetalleEquipo({ navigation, route }) {
  const { idEquipo } = route.params;
  const insets = useSafeAreaInsets();
  const [equipo, setEquipo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Vuelve a la pantalla anterior (el listado)
  const volver = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  // Se carga al abrir la pantalla y cada vez que se vuelve a ella
  useFocusEffect(
    useCallback(() => {
      let activo = true; // evita actualizar la pantalla si ya se cerró
      obtenerDetalleEquipo(idEquipo).then((resultado) => {
        if (!activo) return;
        if (resultado.ok) {
          setEquipo(resultado.dato);
          setError('');
        } else {
          setError(resultado.mensaje);
        }
        setCargando(false);
      });
      return () => {
        activo = false;
      };
    }, [idEquipo])
  );

  return (
    <ScrollView
      style={formStyles.flex}
      contentContainerStyle={[
        formStyles.contenido,
        styles.contenido,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      {/* Encabezado: flecha y título en la misma fila */}
      <View style={styles.encabezado}>
        <TouchableOpacity
          onPress={volver}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.azul} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Detalle de equipo</Text>
      </View>

      {cargando && !equipo ? (
        <ActivityIndicator size="large" color={COLORS.azul} />
      ) : error && !equipo ? (
        <MensajeError mensaje={error} tipo="banner" />
      ) : (
        <>
          {/* Las tarjetas van arriba; este bloque ocupa el espacio libre y deja el botón abajo */}
          <View style={styles.centro}>
            {/* Tarjeta principal: ícono, nombre y etiquetas de tipo y estado, centrados */}
            <View style={[styles.tarjeta, styles.cabecera]}>
              {/* el ícono se agranda sin modificar el componente compartido */}
              <View style={styles.icono}>
                <IconoTipo tipo={equipo.tipo} tamaño="grande" destacado />
              </View>
              <Text style={styles.nombre} numberOfLines={2}>{equipo.nombre}</Text>
              <View style={styles.etiquetas}>
                <EtiquetaTipo tipo={equipo.tipo} />
                <EtiquetaEstado estado={equipo.estado} />
              </View>
            </View>

            {/* Tarjeta de información (solo lectura) */}
            <View style={[styles.tarjeta, styles.informacion]}>
              {/* si no hay fecha, formatearFecha devuelve un guion */}
              <Dato icono="calendar-outline" label="Incorporado" valor={formatearFecha(equipo.fechaAlta)} />
              <Dato icono="layers-outline" label="Cantidad" valor={String(equipo.cantidad ?? '')} />
              <Dato
                icono="document-text-outline"
                label="Descripción"
                valor={equipo.descripcion?.trim()}
                vacio="Sin descripción"
                ultimo
              />
            </View>
          </View>

          {/* Botón principal abajo: ir a editar este equipo */}
          <View style={styles.pie}>
            <TouchableOpacity
              style={[formStyles.boton, styles.boton]}
              onPress={() => navigation.navigate('ModificarEquipo', { idEquipo })}
            >
              <Text style={formStyles.botonTexto}>Editar equipo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Estilos del detalle
const styles = StyleSheet.create({
  // flexGrow: el contenido ocupa todo el alto de la pantalla
  contenido: { flexGrow: 1 },
  centro: { flexGrow: 1 },
  // mismo ancho de botón que en el listado de equipos
  pie: { paddingHorizontal: 10, paddingTop: 12 },

  // flecha y título
  encabezado: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titulo: { flex: 1, fontFamily: FUENTES.bold, fontSize: 24, color: COLORS.azul, marginLeft: 10 },

  // base de las dos tarjetas blancas
  tarjeta: {
    backgroundColor: COLORS.blanco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(30,30,30,0.08)',
    marginBottom: 14,
  },

  // tarjeta principal
  // mismo ancho que la tarjeta de información, con un alto fijo mínimo
  cabecera: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  // el margen deja lugar para el ícono agrandado
  icono: { transform: [{ scale: 1.4 }], marginVertical: 14 },
  nombre: {
    fontFamily: FUENTES.bold,
    fontSize: 24,
    color: COLORS.azul,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },

  // tarjeta de información y sus filas
  informacion: { paddingHorizontal: 16 },
  dato: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  datoSeparador: { borderBottomWidth: 1, borderBottomColor: 'rgba(30,30,30,0.08)' },
  datoIcono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.celeste,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datoTextos: { flex: 1, marginLeft: 12 },
  datoLabel: { fontFamily: FUENTES.regular, fontSize: 13, color: COLORS.gris },
  datoValor: { fontFamily: FUENTES.regular, fontSize: 17, color: COLORS.texto, marginTop: 2 },
  datoVacio: { color: COLORS.placeholder },

  boton: { marginTop: 0 },
});