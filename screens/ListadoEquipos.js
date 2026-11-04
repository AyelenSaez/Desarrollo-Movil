// Pantalla de listado de equipos (fiel a Figma: "Equipos").
// Tiene buscador, filtro por tipo y botones para ver, editar y eliminar.

// React y hooks: useCallback (memoriza funciones), useMemo (calcula la lista filtrada)
// y useState (guarda valores de la pantalla).
import React, { useCallback, useMemo, useState } from 'react';
// Componentes de React Native:
import {
  View,              // contenedor
  Text,              // texto
  TextInput,         // buscador
  TouchableOpacity,  // botón que se puede tocar
  FlatList,          // lista desplazable optimizada para muchos elementos
  ScrollView,        // fila de filtros que se desliza de costado
  ActivityIndicator, // ruedita de carga
  StyleSheet,        // crear estilos
} from 'react-native';
// margenes seguros (notch, barra de abajo)
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Ionicons: íconos (flecha, lupa, ojo, lápiz, papelera).
import { Ionicons } from '@expo/vector-icons';
// useFocusEffect: ejecuta código cada vez que la pantalla vuelve a estar visible.
import { useFocusEffect } from '@react-navigation/native';
// MensajeError: recuadro rojo para mostrar errores de carga.
import MensajeError from '../components/MensajeError';
// MensajeConfirmarEliminacion: cartel que pregunta antes de borrar un equipo.
import MensajeConfirmarEliminacion from '../components/MensajeConfirmarEliminacion';
// auth: usuario logueado, para la inicial del avatar.
import { auth } from '../src/config/firebaseConfig';
// Colores, ícono del tipo y etiqueta del estado (compartidos con el Detalle)
import { COLORES_EQUIPO as COLORS, IconoTipo, EtiquetaEstado } from '../components/EquipoVisual';
// useNotificacion: para mostrar avisos de éxito o error arriba de la pantalla.
import { useNotificacion } from '../components/Notificacion';
// listarEquipos: trae los equipos con nombres de tipo y estado. eliminarEquipo: borra un equipo.
import { listarEquipos, eliminarEquipo } from '../src/services/equipoService';
// Tipos fijos para los filtros (Sonido, Iluminación, Infraestructura)
import { LISTA_TIPOS_EQUIPO } from '../src/utils/tiposEquipos';
import { FUENTES } from '../src/theme/fuentes';

// Filtros de arriba: "Todos" + un filtro por tipo
const FILTROS = ['Todos', ...LISTA_TIPOS_EQUIPO];

// Pasa a minúsculas y saca los acentos, para buscar "iluminacion" y encontrar "Iluminación"
const normalizar = (texto) =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Botón cuadrado chico (ver, editar, eliminar)
function BotonAccion({ icono, color, fondo, onPress, label }) {
  return (
    <TouchableOpacity
      style={[styles.accion, { backgroundColor: fondo }]}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityLabel={label}
    >
      <Ionicons name={icono} size={16} color={color} />
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------
// FILA: muestra un equipo con ícono, nombre, tipo y estado,
// y los botones para verlo, modificarlo o eliminarlo.
// ---------------------------------------------------------------
function FilaEquipo({ equipo, onVer, onModificar, onEliminar }) {
  return (
    <View style={styles.fila}>
      <IconoTipo tipo={equipo.tipo} />

      <View style={styles.filaInfo}>
        <Text style={styles.nombre} numberOfLines={1}>{equipo.nombre}</Text>
        <Text style={styles.tipo}>{equipo.tipo}</Text>
        <EtiquetaEstado estado={equipo.estado} />
      </View>

      <View style={styles.acciones}>
        <BotonAccion icono="eye-outline" color={COLORS.azul} fondo={COLORS.celeste} onPress={onVer} label={`Ver ${equipo.nombre}`} />
        <BotonAccion icono="create-outline" color={COLORS.azul} fondo={COLORS.celeste} onPress={onModificar} label={`Modificar ${equipo.nombre}`} />
        <BotonAccion icono="trash-outline" color={COLORS.rojo} fondo={COLORS.rosa} onPress={onEliminar} label={`Eliminar ${equipo.nombre}`} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------
// PANTALLA: listado de equipos con acceso a registrar, ver, modificar y eliminar
// ---------------------------------------------------------------
export default function ListadoEquipos({ navigation }) {
  const insets = useSafeAreaInsets();
  const { mostrarNotificacion } = useNotificacion();
  // inicial del usuario logueado para el avatar (igual que en Home)
  const usuario = auth.currentUser;
  const inicial = (usuario?.displayName || usuario?.email || 'U').charAt(0).toUpperCase();
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');                 // texto del buscador
  const [filtro, setFiltro] = useState('Todos');                // tipo elegido arriba
  const [equipoAEliminar, setEquipoAEliminar] = useState(null); // equipo que se está por eliminar
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [eliminando, setEliminando] = useState(false);          // true mientras se espera a Firebase

  // Pide los equipos al servicio y los guarda en el estado (o guarda el error)
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

  // Primera carga: todavía no llegó ningún equipo (se muestra solo la ruedita)
  const cargandoInicial = cargando && equipos.length === 0;

  // Equipos que se ven: los del tipo elegido cuyo nombre contiene lo buscado
  const equiposVisibles = useMemo(() => {
    const buscado = normalizar(busqueda.trim());
    return equipos.filter(
      (e) =>
        (filtro === 'Todos' || e.tipo === filtro) &&
        (!buscado || normalizar(e.nombre).includes(buscado))
    );
  }, [equipos, busqueda, filtro]);

  // Al tocar la papelera solo se abre el mensaje de confirmación
  const handleEliminar = (equipo) => {
    setEquipoAEliminar(equipo);
    setMostrarConfirmacion(true);
  };

  // Al confirmar: elimina, notifica el resultado y saca el equipo del listado sin recargar
  const confirmarEliminacion = async () => {
    if (!equipoAEliminar || eliminando) return;
    const { id_equipo } = equipoAEliminar;

    setEliminando(true);
    const resultado = await eliminarEquipo(id_equipo);
    setEliminando(false);
    setMostrarConfirmacion(false);

    if (resultado.ok) {
      mostrarNotificacion(resultado.mensaje, 'exito');
      setEquipos((actuales) => actuales.filter((e) => e.id_equipo !== id_equipo));
    } else {
      mostrarNotificacion(resultado.mensaje, 'error');
    }
  };

  // Lo que va arriba de la lista: buscador, filtros y título de la sección
  const encabezadoLista = (
    <>
      {/* Buscador */}
      <View style={styles.buscador}>
        <Ionicons name="search" size={22} color={COLORS.gris} />
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar equipo"
          placeholderTextColor={COLORS.gris}
          value={busqueda}
          onChangeText={setBusqueda}
          returnKeyType="search"
        />
      </View>

      {/* Filtros por tipo (se deslizan de costado) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
        keyboardShouldPersistTaps="handled"
      >
        {FILTROS.map((f) => {
          const activo = f === filtro;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filtro, activo && styles.filtroActivo]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[styles.filtroTexto, activo && styles.filtroTextoActivo]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error ? <MensajeError mensaje={error} tipo="banner" /> : null}

      {/* Título de la sección y cantidad de equipos */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          {filtro === 'Todos' ? 'Todos los equipos' : filtro}
        </Text>
        <Text style={styles.contador}>
          {equiposVisibles.length} {equiposVisibles.length === 1 ? 'equipo' : 'equipos'}
        </Text>
      </View>
    </>
  );

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      {/* Flecha para volver, título y avatar del usuario */}
      <View style={styles.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={28} color={COLORS.azul} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Equipos</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
      </View>

      {cargandoInicial ? (
        // Ruedita centrada en la pantalla mientras llegan los equipos
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color={COLORS.azul} />
        </View>
      ) : (
        // Lista desplazable de equipos
        // (refreshing/onRefresh: deslizar hacia abajo recarga la lista)
        <FlatList
          data={equiposVisibles}
          keyExtractor={(item) => item.id_equipo}
          contentContainerStyle={styles.lista}
          keyboardShouldPersistTaps="handled"
          refreshing={cargando}
          onRefresh={cargarEquipos}
          ListHeaderComponent={encabezadoLista}
          renderItem={({ item }) => (
            <FilaEquipo
              equipo={item}
              onVer={() => navigation.navigate('DetalleEquipo', { idEquipo: item.id_equipo })}
              onModificar={() => navigation.navigate('ModificarEquipo', { idEquipo: item.id_equipo })}
              onEliminar={() => handleEliminar(item)}
            />
          )}
          ListEmptyComponent={
            !error ? (
              <Text style={styles.vacio}>
                {equipos.length === 0
                  ? 'Todavía no hay equipos registrados.'
                  : 'No se encontraron equipos.'}
              </Text>
            ) : null
          }
        />
      )}

      {/* Botón fijo abajo para registrar un equipo nuevo (no aparece mientras carga) */}
      {!cargandoInicial ? (
        <View style={[styles.pie, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.botonNuevo}
            onPress={() => navigation.navigate('RegistroEquipo')}
          >
            <Text style={styles.botonNuevoTexto}>+ Nuevo equipo</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Mensaje de confirmación previo a eliminar */}
      <MensajeConfirmarEliminacion
        visible={mostrarConfirmacion}
        nombre={equipoAEliminar?.nombre}
        eliminando={eliminando}
        onCancelar={() => setMostrarConfirmacion(false)}
        onConfirmar={confirmarEliminacion}
      />
    </View>
  );
}

// Estilos de la pantalla de listado (medidas de Figma, pantalla de 430 de ancho)
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.fondo },

  // Flecha + título a la izquierda, avatar a la derecha
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  titulo: {
    flex: 1,
    fontFamily: FUENTES.bold,
    fontSize: 30,
    letterSpacing: 0.9,
    color: COLORS.azul,
    marginLeft: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontFamily: FUENTES.bold, fontSize: 30, color: COLORS.blanco },

  // ocupa todo el espacio libre para que la ruedita quede en el centro
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // espacio abajo para que el último equipo no quede tapado por el botón
  lista: { paddingHorizontal: 20, paddingBottom: 24 },

  // Buscador redondeado con lupa
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 30,
    paddingHorizontal: 18,
  },
  buscadorInput: {
    flex: 1,
    fontFamily: FUENTES.regular,
    fontSize: 20,
    color: COLORS.texto,
    marginLeft: 12,
    paddingVertical: 0,
  },

  // Filtros: el elegido va relleno de azul, el resto con borde
  filtros: { gap: 12, paddingVertical: 15 },
  filtro: {
    height: 41,
    minWidth: 104,
    paddingHorizontal: 18,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtroActivo: { backgroundColor: COLORS.azul, borderColor: COLORS.azul },
  filtroTexto: { fontFamily: FUENTES.regular, fontSize: 20, color: COLORS.azul },
  filtroTextoActivo: { color: COLORS.blanco },

  // "Todos los equipos" y "2 equipos"
  seccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  seccionTitulo: { fontFamily: FUENTES.bold, fontSize: 15, letterSpacing: 0.45, color: COLORS.azul },
  contador: { fontFamily: FUENTES.regular, fontSize: 15, color: COLORS.gris },

  // Cada equipo: ícono, datos y botones, con una línea abajo
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separador,
  },
  filaInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  nombre: { fontFamily: FUENTES.bold, fontSize: 15, letterSpacing: 0.45, color: COLORS.azul },
  tipo: { fontFamily: FUENTES.regular, fontSize: 13, color: COLORS.gris, marginBottom: 4 },

  // Botones ver, editar y eliminar en fila
  acciones: { flexDirection: 'row', gap: 14 },
  accion: {
    width: 25,
    height: 25,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vacio: { textAlign: 'center', fontFamily: FUENTES.regular, color: COLORS.gris, fontSize: 15, marginTop: 40 },

  // Botón "+ Nuevo equipo" fijo abajo
  pie: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: COLORS.fondo },
  botonNuevo: {
    height: 60,
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.verde, // verde de la app (el mismo del avatar)
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonNuevoTexto: { fontFamily: FUENTES.bold, fontSize: 24, letterSpacing: 0.72, color: COLORS.blanco },
});
