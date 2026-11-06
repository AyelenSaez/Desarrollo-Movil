// Pantalla de detalle de un equipo (fiel a Figma: "Detalle de equipo").
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

// Caja con borde para mostrar un dato (como los campos del formulario, pero sin editar)
function Dato({ label, valor, style }) {
  return (
    <View style={[formStyles.grupo, style]}>
      <Text style={formStyles.label}>{label}</Text>
      <View style={styles.caja}>
        <Text style={formStyles.valor}>{valor || '—'}</Text>
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
      contentContainerStyle={[formStyles.contenido, { paddingTop: insets.top + 16 }]}
    >
      {/* Flecha para volver */}
      <TouchableOpacity
        style={formStyles.flecha}
        onPress={volver}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Volver"
      >
        <Ionicons name="arrow-back" size={26} color={COLORS.azul} />
      </TouchableOpacity>

      <Text style={[formStyles.titulo, styles.titulo]}>Detalle de equipo</Text>

      {cargando && !equipo ? (
        <ActivityIndicator size="large" color={COLORS.azul} />
      ) : error && !equipo ? (
        <MensajeError mensaje={error} tipo="banner" />
      ) : (
        <>
          {/* Ícono, nombre y etiquetas de tipo y estado, centrados */}
          <View style={styles.cabecera}>
            <IconoTipo tipo={equipo.tipo} tamaño="grande" destacado />
            <Text style={styles.nombre}>{equipo.nombre}</Text>
            <View style={styles.etiquetas}>
              <EtiquetaTipo tipo={equipo.tipo} />
              <EtiquetaEstado estado={equipo.estado} />
            </View>
          </View>

          {/* Dos datos lado a lado */}
          <View style={styles.fila}>
            <Dato label="Incorporado" valor={formatearFecha(equipo.fechaAlta)} style={styles.columna} />
            <Dato label="Cantidad" valor={String(equipo.cantidad ?? "")} style={styles.columna} />
          </View>

          <Dato label="Descripción" valor={equipo.descripcion} />

          {/* Botón principal: ir a editar este equipo */}
          <TouchableOpacity
            style={[formStyles.boton, styles.boton]}
            onPress={() => navigation.navigate('ModificarEquipo', { idEquipo })}
          >
            <Text style={formStyles.botonTexto}>Editar equipo</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Cancelar: vuelve al listado */}
      <TouchableOpacity onPress={volver}>
        <Text style={formStyles.cancelar}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { marginBottom: 12 },
  cabecera: { alignItems: 'center', marginBottom: 30 },
  nombre: {
    fontFamily: FUENTES.bold,
    fontSize: 20,
    letterSpacing: 0.6,
    color: COLORS.azul,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  etiquetas: { flexDirection: 'row', gap: 2 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: 30 },
  columna: { flex: 1 },
  // misma caja que los campos del formulario
  caja: {
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: 10,
    paddingHorizontal: 8,
    minHeight: 60,
    paddingVertical: 16,
    justifyContent: 'center',
    backgroundColor: COLORS.blanco,
  },
  boton: { marginTop: 24 },
});
