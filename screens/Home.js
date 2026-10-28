import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // margenes seguros (notch, barra de abajo)
import { Ionicons } from '@expo/vector-icons'; // iconos que vienen con expo
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { useNotificacion } from '../components/Notificacion';

// paleta de colores de la app
const C = {
  navy: '#0f2747',
  navySoft: '#1c3a63',
  green: '#4e7246',
  greenSoft: '#e3f1dd',
  red: '#922b21',
  bg: '#f4f6f9',
  card: '#ffffff',
  border: '#e3e7ee',
  text: '#0f2747',
  muted: '#6b7787',
  track: '#e6e9ee',
};

// datos de ejemplo, despues se reemplazan por datos de firestore
const RESUMEN = {
  reservasHoy: { total: 1, confirmadas: 1, pendientes: 3 },
  equipos: { disponibles: 100, total: 130, enUsoHoy: 3 },
  enReparacion: 0,
  usuarios: { total: 10, perfiles: 2 },
};

const PROXIMAS_RESERVAS = [
  { id: '1', cliente: 'Cliente 1', evento: 'Cumpleaños', fecha: '03 oct.', hora: '22:00', estado: 'Confirmada' },
];

const ESTADO_EQUIPOS = [
  { label: 'Disponibles', valor: 27, total: 34, color: C.green },
  { label: 'En uso', valor: 5, total: 34, color: C.navy },
  { label: 'En reparación', valor: 2, total: 34, color: C.red },
];

// opciones del menu hamburguesa 
const MENU = [
  { key: 'Inicio', label: 'Inicio', icon: 'home-outline', route: null },
  { key: 'Equipos', label: 'Equipos', icon: 'hardware-chip-outline', route: 'ListadoEquipos' },
];

// ancho del menu lateral:
const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const { mostrarNotificacion } = useNotificacion();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  // datos del usuario logueado para el avatar y el menu
  const usuario = auth.currentUser;
  const nombre = usuario?.displayName || usuario?.email?.split('@')[0] || 'Usuario';
  const inicial = nombre.charAt(0).toUpperCase();

  // abre el menu con animacion desde la izquierda
  const abrirMenu = () => {
    setMenuAbierto(true);
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  // cierra el menu y, si se le pasa una funcion, la ejecuta al terminar la animacion
  const cerrarMenu = (despues) => {
    Animated.parallel([
      Animated.timing(slide, { toValue: -DRAWER_WIDTH, duration: 180, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setMenuAbierto(false);
      if (typeof despues === 'function') despues();
    });
  };

  // cierra el menu y navega a la pantalla elegida
  const irA = (item) => {
    cerrarMenu(() => {
      if (item.route) navigation.navigate(item.route);
    });
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      mostrarNotificacion('Sesión cerrada correctamente.', 'info');
    } catch (error) {
      mostrarNotificacion('Hubo un problema al cerrar sesión.', 'error');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.card} />

      {/* boton hamburguesa y logo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={abrirMenu} style={styles.iconBtn} accessibilityLabel="Abrir menú">
          <Ionicons name="menu" size={28} color={C.navy} />
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.headerLogo} />
        <View style={styles.headerEspacio} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.saludo}>BIENVENIDO</Text>
        <Text style={styles.subSaludo}>Hola, {nombre}. Este es el resumen de hoy.</Text>

        {/* tarjetas de resumen */}
        <View style={styles.grid}>
          <StatCard
            titulo="Reservas de hoy"
            valor={RESUMEN.reservasHoy.total}
            detalle={`${RESUMEN.reservasHoy.confirmadas} confirmada · ${RESUMEN.reservasHoy.pendientes} pendientes`}
            icon="calendar-outline"
          />
          <StatCard
            titulo="Equipos disponibles"
            valor={`${RESUMEN.equipos.disponibles}/${RESUMEN.equipos.total}`}
            detalle={`${RESUMEN.equipos.enUsoHoy} en uso por reservas de hoy`}
            detalleColor={C.green}
            icon="cube-outline"
            onPress={() => navigation.navigate('ListadoEquipos')}
          />
          <StatCard
            titulo="En reparación"
            valor={RESUMEN.enReparacion}
            detalle="Fuera de servicio temporalmente"
            icon="construct-outline"
          />
          <StatCard
            titulo="Usuarios del sistema"
            valor={RESUMEN.usuarios.total}
            detalle={`${RESUMEN.usuarios.perfiles} perfiles definidos`}
            icon="people-outline"
          />
        </View>

        {/* proximas reservas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Próximas reservas</Text>
            <Text style={styles.link}>Ver todas</Text>
          </View>
          {PROXIMAS_RESERVAS.length === 0 ? (
            <Text style={styles.vacio}>No hay reservas próximas.</Text>
          ) : (
            PROXIMAS_RESERVAS.map((r, i) => (
              <View
                key={r.id}
                style={[styles.reserva, i < PROXIMAS_RESERVAS.length - 1 && styles.reservaDivider]}
              >
                <View style={[styles.avatar, styles.avatarReserva]}>
                  <Text style={styles.avatarText}>{iniciales(r.cliente)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reservaNombre}>{r.cliente}</Text>
                  <Text style={styles.reservaEvento}>{r.evento}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.reservaFecha}>
                    {r.fecha} {r.hora}
                  </Text>
                  <View style={[styles.badge, r.estado !== 'Confirmada' && styles.badgePendiente]}>
                    <Text style={[styles.badgeText, r.estado !== 'Confirmada' && { color: '#8a5a00' }]}>
                      {r.estado}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* estado de equipos: barras de progreso, toda la tarjeta lleva al listado */}
        <TouchableOpacity
          style={styles.section}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ListadoEquipos')}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Estado de equipos</Text>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
          {ESTADO_EQUIPOS.map((e) => (
            <View key={e.label} style={{ marginBottom: 14 }}>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>{e.label}</Text>
                <Text style={styles.barValue}>
                  {e.valor}/{e.total}
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    { width: `${e.total ? (e.valor / e.total) * 100 : 0}%`, backgroundColor: e.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </TouchableOpacity>
      </ScrollView>

      {/* menu hamburguesa */}
      <Modal visible={menuAbierto} transparent animationType="none" onRequestClose={cerrarMenu}>
        <Animated.View style={[styles.overlay, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={cerrarMenu} />
        </Animated.View>

        {/* panel lateral */}
        <Animated.View
          style={[
            styles.drawer,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, transform: [{ translateX: slide }] },
          ]}
        >
          <View style={styles.drawerTop}>
            <View style={styles.drawerUser}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{inicial}</Text>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.drawerNombre} numberOfLines={1}>
                  {nombre}
                </Text>
                <Text style={styles.drawerEmail} numberOfLines={1}>
                  {usuario?.email ?? ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={cerrarMenu} style={styles.iconBtn} accessibilityLabel="Cerrar menú">
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginTop: 24 }}>
            {MENU.map((item) => {
              const activo = item.key === 'Inicio'; 
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuItem, activo && styles.menuItemActivo]}
                  onPress={() => irA(item)}
                >
                  <Ionicons name={item.icon} size={20} color="#fff" style={{ marginRight: 14 }} />
                  <Text style={styles.menuText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logout} onPress={() => cerrarMenu(handleLogOut)}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 14 }} />
            <Text style={styles.menuText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
}

// tarjeta de resumen 
function StatCard({ titulo, valor, detalle, detalleColor, icon, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {titulo}
        </Text>
        <Ionicons name={icon} size={16} color={C.muted} />
      </View>
      <Text style={styles.cardValue}>{valor}</Text>
      <Text style={[styles.cardDetail, detalleColor && { color: detalleColor }]} numberOfLines={2}>
        {detalle}
      </Text>
    </Wrapper>
  );
}

// devuelve las iniciales de un nombre
function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // header
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  iconBtn: { padding: 6 },
  headerEspacio: { width: 40 }, // mismo ancho que el boton hamburguesa para centrar el logo
  headerLogo: {
    height: 36,
    width: undefined,
    aspectRatio: 2170 / 725, 
    resizeMode: 'contain',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarReserva: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // contenido
  content: { padding: 16 },
  saludo: { fontSize: 22, fontWeight: '800', color: C.navy, letterSpacing: 1 },
  subSaludo: { fontSize: 14, color: C.muted, marginTop: 4, marginBottom: 16 },

  // tarjetas de resumen
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48.5%',
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000', // sombra en ios
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // sombra en android
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 13, color: C.muted, flex: 1, marginRight: 6 },
  cardValue: { fontSize: 26, fontWeight: '800', color: C.navy, marginVertical: 6 },
  cardDetail: { fontSize: 11, color: C.muted },

  // secciones
  section: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: C.navy },
  link: { fontSize: 13, fontWeight: '700', color: C.green },
  vacio: { color: C.muted, fontSize: 14 },

  // reservas
  reserva: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  reservaDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  reservaNombre: { fontSize: 15, color: C.text, fontWeight: '600' },
  reservaEvento: { fontSize: 12, color: C.muted, marginTop: 2 },
  reservaFecha: { fontSize: 13, color: C.text, marginBottom: 4 },
  badge: { backgroundColor: C.greenSoft, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgePendiente: { backgroundColor: '#fdf0d5' },
  badgeText: { fontSize: 11, color: C.green, fontWeight: '600' },

  // barras de estado
  barRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 14, color: C.text },
  barValue: { fontSize: 13, color: C.muted },
  track: { height: 10, borderRadius: 5, backgroundColor: C.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },

  // menu lateral
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 20, 40, 0.45)' },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: C.navy,
    paddingHorizontal: 16,
  },
  drawerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerUser: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  drawerNombre: { color: '#fff', fontWeight: '700', fontSize: 16 },
  drawerEmail: { color: '#b8c4d6', fontSize: 12, marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActivo: { backgroundColor: C.navySoft },
  menuText: { color: '#fff', fontSize: 16 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: C.red,
  },
});