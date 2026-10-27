import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MensajeError from '../components/MensajeError';
import { useNotificacion } from '../components/Notificacion';
import { listarEquipos, eliminarEquipo } from '../src/services/equipoService';

// Mismos colores que RegistroEquipo, SignUp y Login
const COLORS = {
  azul: '#0b2f5b',
  verde: '#4e7246',
  borde: '#C9CED6',
  icono: '#6B7280',
  error: '#e05252',
  blanco: '#FFFFFF',
};

// Color de la etiqueta de cada estado
const COLOR_ESTADO = {
  Disponible: '#4e7246',
  'En uso': '#0b2f5b',
  'En reparación': '#c47f17',
  'Fuera de servicio': '#e05252',
};

// En web Alert.alert no muestra botones, por eso se usa window.confirm
function confirmarEliminar(nombre, onConfirmar) {
  const mensaje = `¿Seguro que querés eliminar "${nombre}"?`;
  if (Platform.OS === 'web') {
    if (window.confirm(mensaje)) onConfirmar();
    return;
  }
  Alert.alert('Eliminar equipo', mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirmar },
  ]);
}

// ---------------------------------------------------------------
// TARJETA: muestra un equipo con nombre, tipo, cantidad y estado,
// y los botones para modificarlo o eliminarlo.
// ---------------------------------------------------------------
function TarjetaEquipo({ equipo, onModificar, onEliminar }) {
  const colorEstado = COLOR_ESTADO[equipo.estado] ?? COLORS.icono;

  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaInfo}>
        <Text style={styles.nombre}>{equipo.nombre}</Text>
        <Text style={styles.detalle}>Tipo: {equipo.tipo}</Text>
        <Text style={styles.detalle}>Cantidad: {equipo.cantidad}</Text>

        {/* Etiqueta de color con el estado */}
        <View style={[styles.estado, { backgroundColor: colorEstado }]}>
          <Text style={styles.estadoTexto}>{equipo.estado}</Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          onPress={onModificar}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Modificar ${equipo.nombre}`}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.azul} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEliminar}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Eliminar ${equipo.nombre}`}
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------
// PANTALLA: listado de equipos con acceso a registrar, modificar y eliminar
// ---------------------------------------------------------------
export default function ListadoEquipos({ navigation }) {
  const { mostrarNotificacion } = useNotificacion();
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarEquipos = useCallback(async () => {
    setCargando(true);
    const resultado = await listarEquipos();
    if (resultado.ok) {
      setEquipos(resultado.datos);
      setError('');
    } else {
      setError(resultado.mensaje);
    }
    setCargando(false);
  }, []);

  // Se recarga cada vez que se vuelve a esta pantalla (después de registrar o modificar)
  useFocusEffect(
    useCallback(() => {
      cargarEquipos();
    }, [cargarEquipos])
  );

  const handleEliminar = (equipo) => {
    confirmarEliminar(equipo.nombre, async () => {
      const resultado = await eliminarEquipo(equipo.id_equipo);
      if (resultado.ok) {
        mostrarNotificacion('Equipo eliminado correctamente.', 'exito');
        setEquipos((actuales) => actuales.filter((e) => e.id_equipo !== equipo.id_equipo));
      } else {
        mostrarNotificacion(resultado.mensaje, 'error');
      }
    });
  };

  return (
    <View style={styles.flex}>
      {/* Flecha para volver: queda fija arriba a la izquierda */}
      <TouchableOpacity
        style={styles.flecha}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.azul} />
      </TouchableOpacity>

      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Equipos</Text>

        {/* Acceso a registrar un equipo nuevo */}
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => navigation.navigate('RegistroEquipo')}
        >
          <Ionicons name="add" size={20} color={COLORS.blanco} />
          <Text style={styles.botonAgregarTexto}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <MensajeError mensaje={error} tipo="banner" />
        </View>
      ) : null}

      {cargando && equipos.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.azul} style={styles.cargando} />
      ) : (
        // Lista desplazable de equipos
        <FlatList
          data={equipos}
          keyExtractor={(item) => item.id_equipo}
          contentContainerStyle={styles.lista}
          refreshing={cargando}
          onRefresh={cargarEquipos}
          renderItem={({ item }) => (
            <TarjetaEquipo
              equipo={item}
              onModificar={() => navigation.navigate('ModificarEquipo', { idEquipo: item.id_equipo })}
              onEliminar={() => handleEliminar(item)}
            />
          )}
          ListEmptyComponent={
            !error ? <Text style={styles.vacio}>Todavía no hay equipos registrados.</Text> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.blanco },

  // Flecha de volver fija arriba a la izquierda (igual que RegistroEquipo)
  flecha: { position: 'absolute', top: 40, left: 20, zIndex: 1 },

  // Título y botón Agregar en la misma fila
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 12,
  },
  titulo: { fontSize: 22, fontWeight: '700', color: COLORS.azul },

  botonAgregar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.verde,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  botonAgregarTexto: { color: COLORS.blanco, fontSize: 15, fontWeight: '700', marginLeft: 4 },

  errorWrap: { paddingHorizontal: 20 },
  cargando: { marginTop: 40 },

  lista: { paddingHorizontal: 20, paddingBottom: 32 },

  // Tarjeta de cada equipo: borde gris redondeado
  tarjeta: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  tarjetaInfo: { flex: 1 },
  nombre: { fontSize: 17, fontWeight: '700', color: COLORS.azul, marginBottom: 4 },
  detalle: { fontSize: 14, color: '#111827', marginBottom: 2 },

  estado: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  estadoTexto: { color: COLORS.blanco, fontSize: 13, fontWeight: '600' },

  // Botones de modificar y eliminar, uno arriba del otro
  acciones: { justifyContent: 'space-between', alignItems: 'center', marginLeft: 12 },

  vacio: { textAlign: 'center', color: COLORS.icono, fontSize: 15, marginTop: 40 },
});
