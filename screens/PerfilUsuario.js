    import React, { useState, useCallback } from "react";

    // componentes de React Native que se usan para armar la pantalla
    import {
    View,              // caja contenedora
    Text,              // texto
    TouchableOpacity,  // botón que se puede tocar
    ScrollView,        // pantalla con scroll
    StyleSheet,        // estilos
    ActivityIndicator, // ruedita de carga mientras se consulta el perfil
    Image,             // muestra la foto de perfil
    Alert,             // cartel con las opciones de la foto
    } from "react-native";

    // useFocusEffect: vuelve a leer el perfil cada vez que se muestra la pantalla
    // (por ejemplo, al volver de Editar perfil con los datos nuevos)
    import { useFocusEffect } from "@react-navigation/native";

    // márgenes seguros (notch, barra de estado)
    import { useSafeAreaInsets } from "react-native-safe-area-context";

    // ImagePicker: permite tomar una foto o elegirla de la galería
    import * as ImagePicker from "expo-image-picker";

    // iconos
    import { Ionicons } from "@expo/vector-icons";

    // foto de perfil guardada en el teléfono (la comparten Mi perfil, el menú y Equipos)
    import { useFotoPerfil, guardarFotoPerfil } from "../src/utils/fotoPerfil";
    // colores de las pantallas (medidos de Figma)
    import { COLORES_EQUIPO } from "../components/EquipoVisual";
    // fuente Work Sans
    import { FUENTES } from "../src/theme/fuentes";
    // obtenerPerfil: lee el perfil del usuario con sesión iniciada desde Firestore (S6-06)
    import { obtenerPerfil } from "../src/services/perfilService";
    // visor de la foto a pantalla completa
    import VisorFoto from "../components/VisorFoto";

    // Colores de la pantalla: los de Figma más los de los avisos
    const COLORS = {
    ...COLORES_EQUIPO,
    error: "#e05252",
    errorFondo: "#fdecec",
    };

    // ---------------------------------------------------------------
    // DATO: fila de solo lectura con ícono, título y valor.
    // Si el valor está vacío muestra "Sin completar" en gris.
    // ---------------------------------------------------------------
    function DatoPerfil({ icono, label, valor, ultimo }) {
    const vacio = !valor || String(valor).trim() === "";

    return (
        <View style={[styles.dato, !ultimo && styles.datoSeparador]}>
        {/* ícono en un círculo celeste */}
        <View style={styles.datoIcono}>
            <Ionicons name={icono} size={20} color={COLORS.azul} />
        </View>

        {/* título y valor */}
        <View style={styles.datoTextos}>
            <Text style={styles.datoLabel}>{label}</Text>
            <Text
            style={[styles.datoValor, vacio && styles.datoVacio]}
            numberOfLines={1}
            >
            {vacio ? "Sin completar" : valor}
            </Text>
        </View>
        </View>
    );
    }

    // ---------------------------------------------------------------
    // PANTALLA: Mi perfil (solo vista)
    // Muestra los datos del usuario sin campos editables.
    // Para cambiarlos, el botón "Editar perfil" abre la pantalla EditarPerfil.
    // ---------------------------------------------------------------
    export default function PerfilUsuario({ navigation }) {
    const insets = useSafeAreaInsets();

    // datos del perfil que se muestran en pantalla
    const [perfil, setPerfil] = useState({ nombre: "", apellido: "", email: "", telefono: "" });

    // true solo la primera vez que se consulta el perfil (muestra la ruedita de carga)
    const [cargando, setCargando] = useState(true);

    // mensaje de error si la consulta falla (null = sin error)
    const [errorCarga, setErrorCarga] = useState(null);

    // foto de perfil guardada en el teléfono (null = se muestra la inicial)
    const [fotoPerfil, setFotoPerfil] = useFotoPerfil();

    // true = se muestra la foto a pantalla completa
    const [verFoto, setVerFoto] = useState(false);

    // S7-03: cada vez que se muestra la pantalla, carga el perfil del usuario con sesión iniciada
    useFocusEffect(
        useCallback(() => {
        let activo = true; // evita actualizar la pantalla si ya se cerró

        const cargarPerfil = async () => {
            // obtenerPerfil no lanza excepciones: devuelve { ok: true, datos } o { ok: false, mensaje }
            const resultado = await obtenerPerfil();
            if (!activo) return;

            // si todavía no tiene perfil guardado, viene al menos el correo
            if (resultado.datos) setPerfil(resultado.datos);

            if (resultado.ok) {
            setErrorCarga(null);
            } else if (resultado.codigo === "not-found") {
            setErrorCarga('Todavía no cargaste tus datos. Tocá "Editar perfil" para completarlos.');
            } else {
            setErrorCarga(resultado.mensaje);
            }
            setCargando(false);
        };

        cargarPerfil();

        // al salir de la pantalla se marca como inactiva
        return () => {
            activo = false;
        };
        }, [])
    );

    // nombre completo para mostrar debajo de la foto
    const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`.trim();

    // vuelve a la pantalla anterior
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    // abre la pantalla con el formulario para editar el perfil
    const irAEditar = () => navigation.navigate("EditarPerfil");

    // letra que va dentro del círculo (primera letra del nombre)
    const inicial = perfil.nombre.trim().charAt(0).toUpperCase() || "?";

    // abre la cámara o la galería y guarda la foto elegida
    const elegirFoto = async (origen) => {
        try {
        // para usar la cámara hay que pedir permiso
        if (origen === "camara") {
            const permiso = await ImagePicker.requestCameraPermissionsAsync();
            if (!permiso.granted) {
            Alert.alert("Permiso necesario", "Activá el permiso de la cámara en los ajustes del teléfono.");
            return;
            }
        }

        const opciones = {
            mediaTypes: ["images"], // solo fotos
            allowsEditing: true,    // permite recortar
            aspect: [1, 1],         // recorte cuadrado en Android (en iOS ya es cuadrado)
            quality: 0.7,
        };
        const resultado =
            origen === "camara"
            ? await ImagePicker.launchCameraAsync(opciones)
            : await ImagePicker.launchImageLibraryAsync(opciones);

        if (resultado.canceled) return; // el usuario salió sin elegir nada

        const uri = resultado.assets[0].uri;
        setFotoPerfil(uri);            // la muestra enseguida
        await guardarFotoPerfil(uri);  // la guarda en el teléfono
        } catch (error) {
        console.log("No se pudo cargar la foto:", error);
        Alert.alert("Error", "No se pudo cargar la foto. Intentá nuevamente.");
        }
    };

    // cartel con las opciones para cambiar la foto
    const mostrarOpciones = () => {
        Alert.alert("Foto de perfil", "¿Cómo querés agregar la foto?", [
        { text: "Tomar foto", onPress: () => elegirFoto("camara") },
        { text: "Elegir de la galería", onPress: () => elegirFoto("galeria") },
        { text: "Cancelar", style: "cancel" },
        ]);
    };

    // mientras se consulta el perfil, se muestra una ruedita en toda la pantalla (S7-03)
    if (cargando) {
        return (
        <View style={[styles.flex, { alignItems: "center", justifyContent: "center" }]}>
            <ActivityIndicator size="large" color={COLORS.verde} />
        </View>
        );
    }

    return (
        <View style={styles.flex}>
        {/* encabezado azul: flecha, título, foto, nombre, correo y botón Editar perfil */}
        <View style={[styles.encabezado, { paddingTop: insets.top + 16 }]}>
            <View style={styles.encabezadoTitulo}>
            <TouchableOpacity
                onPress={volver}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Volver"
            >
                <Ionicons name="arrow-back" size={24} color={COLORS.blanco} />
            </TouchableOpacity>
            <Text style={styles.titulo}>Mi perfil</Text>
            </View>

            {/* bloque centrado con la foto y los datos principales */}
            <View style={styles.perfilCentro}>
            {/* círculo con la foto (o la inicial si no hay foto) y la cámara en la esquina.
                Con foto: tocarla la agranda. La cámara permite tomar o elegir otra. */}
            <View>
                <TouchableOpacity
                style={styles.avatarBorde}
                onPress={fotoPerfil ? () => setVerFoto(true) : mostrarOpciones}
                activeOpacity={0.8}
                accessibilityLabel={fotoPerfil ? "Ver foto de perfil" : "Agregar foto de perfil"}
                >
                <View style={styles.avatar}>
                    {fotoPerfil ? (
                    <Image source={{ uri: fotoPerfil }} style={styles.avatarFoto} />
                    ) : (
                    <Text style={styles.avatarLetra}>{inicial}</Text>
                    )}
                </View>
                </TouchableOpacity>

                {/* botón de cámara: se ve siempre, haya foto o no */}
                <TouchableOpacity
                style={styles.botonCamara}
                onPress={mostrarOpciones}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Cambiar foto de perfil"
                >
                <Ionicons name="camera-outline" size={18} color={COLORS.azul} />
                </TouchableOpacity>
            </View>

            <Text style={styles.nombreEncabezado} numberOfLines={1}>
                {nombreCompleto || "Sin nombre"}
            </Text>
            <Text style={styles.emailEncabezado} numberOfLines={1}>
                {perfil.email}
            </Text>

            {/* botón blanco con lápiz: abre la pantalla Editar perfil */}
            <TouchableOpacity
                style={styles.botonEditar}
                onPress={irAEditar}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Editar perfil"
            >
                <Ionicons name="pencil" size={16} color={COLORS.azul} />
                <Text style={styles.textoEditar}>Editar perfil</Text>
            </TouchableOpacity>
            </View>
        </View>

        <ScrollView contentContainerStyle={styles.cuerpo}>
            {/* aviso rojo si falló la carga del perfil o todavía no tiene datos (S7-03) */}
            {errorCarga ? (
            <View style={styles.banner}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                <Text style={styles.bannerMensaje}>{errorCarga}</Text>
            </View>
            ) : null}

            {/* tarjeta con los datos del usuario (solo lectura) */}
            <Text style={styles.seccion}>Información personal</Text>
            <View style={styles.tarjeta}>
            <DatoPerfil icono="person-outline" label="Nombre" valor={perfil.nombre} />
            <DatoPerfil icono="people-outline" label="Apellido" valor={perfil.apellido} />
            <DatoPerfil icono="mail-outline" label="Correo electrónico" valor={perfil.email} />
            <DatoPerfil icono="call-outline" label="Teléfono" valor={perfil.telefono} ultimo />
            </View>

        </ScrollView>

        {/* foto a pantalla completa */}
        <VisorFoto visible={verFoto} uri={fotoPerfil} onCerrar={() => setVerFoto(false)} />
        </View>
    );
    }

    // ---------------------------------------------------------------
    // ESTILOS
    // ---------------------------------------------------------------
    const styles = StyleSheet.create({
    // ocupa toda la pantalla con el fondo de Figma
    flex: { flex: 1, backgroundColor: COLORS.fondo },

    // encabezado azul con las esquinas de abajo redondeadas
    encabezado: {
        backgroundColor: COLORS.azul,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingBottom: 28,
    },

    // fila con la flecha y el título "Mi perfil"
    encabezadoTitulo: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    titulo: { fontFamily: FUENTES.bold, fontSize: 24, color: COLORS.blanco, marginLeft: 10 },

    // foto, nombre, correo y botón centrados
    perfilCentro: { alignItems: "center" },

    // aro blanco suave alrededor de la foto
    avatarBorde: {
        padding: 4,
        borderRadius: 44,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    // círculo verde con la foto o la inicial
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.verde,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden", // recorta la foto en forma de círculo
    },
    // foto de perfil: ocupa todo el círculo
    avatarFoto: { width: "100%", height: "100%" },
    avatarLetra: { fontFamily: FUENTES.bold, fontSize: 32, color: COLORS.blanco },

    // botón chico de cámara, abajo a la derecha de la foto
    botonCamara: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.blanco,
        alignItems: "center",
        justifyContent: "center",
    },

    // nombre y correo debajo de la foto
    nombreEncabezado: {
        fontFamily: FUENTES.semibold,
        fontSize: 20,
        color: COLORS.blanco,
        marginTop: 14,
    },
    emailEncabezado: {
        fontFamily: FUENTES.regular,
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },

    // botón "Editar perfil": píldora blanca con lápiz azul
    botonEditar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.blanco,
        borderRadius: 22,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 16,
        // sombra suave para que se note que es un botón
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    textoEditar: { fontFamily: FUENTES.semibold, fontSize: 15, color: COLORS.azul, marginLeft: 8 },

    // márgenes del cuerpo
    cuerpo: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

    // aviso rojo
    banner: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        backgroundColor: COLORS.errorFondo,
    },
    bannerMensaje: {
        flex: 1,
        fontFamily: FUENTES.regular,
        fontSize: 13,
        color: COLORS.error,
        marginLeft: 8,
    },

    // título de la tarjeta
    seccion: {
        fontFamily: FUENTES.semibold,
        fontSize: 16,
        color: COLORS.azulLabel,
        marginBottom: 10,
    },

    // tarjeta blanca con los datos
    tarjeta: {
        backgroundColor: COLORS.blanco,
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "rgba(30,30,30,0.08)",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    // fila de cada dato
    dato: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
    datoSeparador: { borderBottomWidth: 1, borderBottomColor: "rgba(30,30,30,0.08)" },
    datoIcono: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.celeste,
        alignItems: "center",
        justifyContent: "center",
    },
    datoTextos: { flex: 1, marginLeft: 14 },
    datoLabel: { fontFamily: FUENTES.regular, fontSize: 13, color: COLORS.gris },
    datoValor: { fontFamily: FUENTES.medium, fontSize: 16, color: COLORS.texto, marginTop: 2 },
    datoVacio: { fontFamily: FUENTES.regular, fontStyle: "italic", color: "#9AA1AB" },
    });