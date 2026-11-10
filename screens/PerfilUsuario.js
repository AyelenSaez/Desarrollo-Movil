    import React, { useState, useEffect } from "react";

    // componentes de React Native que se usan para armar la pantalla
    import {
    View,                  // caja contenedora
    Text,                  // texto
    TextInput,             // campo donde se escribe
    TouchableOpacity,      // botón que se puede tocar
    ScrollView,            // pantalla con scroll
    StyleSheet,            // estilos
    KeyboardAvoidingView,  // evita que el teclado tape los campos
    Platform,              // para saber si es iOS o Android
    ActivityIndicator,     // ruedita de carga mientras se consulta el perfil
    } from "react-native";

    // márgenes seguros (notch, barra de estado)
    import { useSafeAreaInsets } from "react-native-safe-area-context";

    // iconos
    import { Ionicons } from "@expo/vector-icons";

    // mismo componente de error que usan login, registro y equipos
    import MensajeError from "../components/MensajeError";

    // colores de las pantallas (medidos de Figma)
    import { COLORES_EQUIPO } from "../components/EquipoVisual";
    // fuente Work Sans
    import { FUENTES } from "../src/theme/fuentes";
      // obtenerPerfil: lee el perfil del usuario con sesión iniciada desde Firestore (S6-06)
    import { obtenerPerfil } from "../src/services/perfilService";
    // Colores de la pantalla: los de Figma más los de los avisos
    const COLORS = {
    ...COLORES_EQUIPO,
    error: "#e05252",
    errorFondo: "#fdecec",
    exitoFondo: "#daf6d0",
    exitoTexto: "#334b27",
    };



    // ---------------------------------------------------------------
    // BANNER: aviso de éxito (verde) o de error (rojo) con botón para cerrarlo.
    // ---------------------------------------------------------------
    function BannerAviso({ tipo, mensaje, onCerrar }) {
    const esExito = tipo === "exito";
    const color = esExito ? COLORS.exitoTexto : COLORS.error;

    return (
        <View
        style={[
            styles.banner,
            { backgroundColor: esExito ? COLORS.exitoFondo : COLORS.errorFondo },
        ]}
        >
        {/* ícono según el tipo de aviso */}
        <Ionicons
            name={esExito ? "checkmark-circle-outline" : "alert-circle-outline"}
            size={18}
            color={color}
        />

        {/* título y mensaje */}
        <View style={styles.bannerTextos}>
            <Text style={[styles.bannerTitulo, { color }]}>
            {esExito ? "Éxito" : "Error"}
            </Text>
            <Text style={[styles.bannerMensaje, { color }]}>{mensaje}</Text>
        </View>

        {/* X para cerrar el aviso */}
        <TouchableOpacity
            onPress={onCerrar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cerrar aviso"
        >
            <Ionicons name="close" size={18} color={color} />
        </TouchableOpacity>
        </View>
    );
    }

    // ---------------------------------------------------------------
    // CAMPO: título arriba, caja con borde, lápiz a la derecha y error abajo.
    // Si le llega "error", el borde se pone rojo y se muestra el mensaje.
    // ---------------------------------------------------------------
    function CampoPerfil({ label, error, ...inputProps }) {
    return (
        <View style={styles.grupo}>
        {/* título del campo */}
        <Text style={styles.label}>{label}</Text>

        {/* caja del campo: borde rojo si hay error */}
        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
            <TextInput
            style={styles.input}
            placeholderTextColor="#9AA1AB"
            {...inputProps} // value, onChangeText, keyboardType, etc.
            />
            {/* lápiz que indica que se puede editar */}
            <Ionicons
            name="create-outline"
            size={20}
            color={error ? COLORS.error : COLORS.azul}
            />
        </View>

        {/* mensaje de error (mismo componente que en el resto de la app) */}
        {error ? (
            <View style={styles.errorWrap}>
            <MensajeError mensaje={error} />
            </View>
        ) : null}
        </View>
    );
    }
    // ---------------------------------------------------------------
    // PANTALLA: Mi perfil
    // ---------------------------------------------------------------
    export default function PerfilUsuario({ navigation }) {
    const insets = useSafeAreaInsets();

    // un estado por cada campo (arrancan vacíos y se completan con los datos de Firestore)
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");

    // true mientras se consulta el perfil (muestra la ruedita de carga)
    const [cargando, setCargando] = useState(true);

    // mensaje de error si la consulta falla (null = sin error)
    const [errorCarga, setErrorCarga] = useState(null);

    // S7-03: al abrir la pantalla, carga el perfil del usuario con sesión iniciada
    useEffect(() => {
        let activo = true; // evita actualizar la pantalla si ya se cerró

        const cargarPerfil = async () => {
        setCargando(true);
        setErrorCarga(null);

        // obtenerPerfil no lanza excepciones: devuelve { ok: true, datos } o { ok: false, mensaje }
        const resultado = await obtenerPerfil();
        if (!activo) return;

        if (resultado.ok) {
            // precarga los campos con los datos del usuario
            setNombre(resultado.datos.nombre);
            setEmail(resultado.datos.email);
            setTelefono(resultado.datos.telefono);
        } else {
            // muestra el mensaje de error en el banner rojo
            setErrorCarga(resultado.mensaje);
        }
        setCargando(false);
        };

        cargarPerfil();

        // al salir de la pantalla se marca como inactiva
        return () => {
        activo = false;
        };
    }, []);
    // aviso que se muestra arriba del formulario: { tipo: "exito" | "error", mensaje } o null
    const [aviso, setAviso] = useState(null);

    // errores de cada campo; S7-04 los completa con las validaciones de zod.
    // Ejemplo: { nombre: "Este campo es obligatorio" }
    const errores = {};

    // letra que va dentro del círculo (primera letra del nombre)
    const inicial = nombre.trim().charAt(0).toUpperCase() || "?";

    // vuelve a la pantalla anterior
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    // Se ejecuta al tocar "Guardar cambios".
    // SOLO DE PRUEBA: muestra el banner verde. S7-05 lo reemplaza por el guardado real
    // y muestra el banner rojo si falla.
    const handleGuardar = () => {
        setAviso({ tipo: "exito", mensaje: "Los cambios se guardaron correctamente." });
    };

    // Se ejecuta al tocar "Cerrar sesión".
    // S7-06 lo conecta con la pantalla de confirmación.
    const handleCerrarSesion = () => {
        console.log("Cerrar sesión: pendiente de S7-06");
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
        // para que el teclado no tape los campos en ios
        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        {/* encabezado azul: flecha, título, círculo con la inicial, nombre y correo */}
        <View style={[styles.encabezado, { paddingTop: insets.top + 16 }]}>
            <View style={styles.encabezadoTitulo}>
            <TouchableOpacity
                onPress={volver}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Volver"
            >
                <Ionicons name="arrow-back" size={28} color={COLORS.blanco} />
            </TouchableOpacity>
            <Text style={styles.titulo}>Mi perfil</Text>
            </View>

            <View style={styles.perfilFila}>
            {/* círculo verde con la inicial y la cámara (la cámara se conecta en S7-07) */}
            <View>
                <View style={styles.avatar}>
                <Text style={styles.avatarLetra}>{inicial}</Text>
                </View>
                <View style={styles.camara}>
                <Ionicons name="camera-outline" size={16} color={COLORS.azul} />
                </View>
            </View>

            {/* nombre y correo al lado del círculo */}
            <View style={styles.datos}>
                <Text style={styles.nombreEncabezado} numberOfLines={1}>
                {nombre}
                </Text>
                <Text style={styles.emailEncabezado} numberOfLines={1}>
                {email}
                </Text>
            </View>
            </View>
        </View>

        {/* scroll por si la pantalla es chica; mantiene los toques con el teclado abierto */}
        <ScrollView
            contentContainerStyle={styles.cuerpo}
            keyboardShouldPersistTaps="handled"
        >            {/* banner rojo si falló la carga del perfil (S7-03) */}
            {errorCarga ? (
            <BannerAviso
                tipo="error"
                mensaje={errorCarga}
                onCerrar={() => setErrorCarga(null)}
            />
            ) : null}
            {/* banner de éxito o error */}
            {aviso ? (
            <BannerAviso
                tipo={aviso.tipo}
                mensaje={aviso.mensaje}
                onCerrar={() => setAviso(null)}
            />
            ) : null}

            {/* Nombre completo */}
            <CampoPerfil
            label="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            error={errores.nombre}
            />

            {/* Correo electrónico */}
            <CampoPerfil
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errores.email}
            />

            {/* Teléfono */}
            <CampoPerfil
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            error={errores.telefono}
            />

            {/* botón verde: Guardar cambios */}
            <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
            <Text style={styles.textoGuardar}>Guardar cambios</Text>
            </TouchableOpacity>

            {/* botón con borde rojo: Cerrar sesión */}
            <TouchableOpacity style={styles.botonCerrar} onPress={handleCerrarSesion}>
            <Text style={styles.textoCerrar}>Cerrar sesión</Text>
            </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
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
    encabezadoTitulo: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    titulo: { fontFamily: FUENTES.bold, fontSize: 28, color: COLORS.blanco, marginLeft: 12 },

    // fila con el círculo y los datos del usuario
    perfilFila: { flexDirection: "row", alignItems: "center" },

    // círculo verde con la inicial
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: COLORS.verde,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarLetra: { fontFamily: FUENTES.bold, fontSize: 40, color: COLORS.blanco },

    // cámara chiquita abajo a la derecha del círculo
    camara: {
        position: "absolute",
        right: -2,
        bottom: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.blanco,
        alignItems: "center",
        justifyContent: "center",
    },

    // nombre y correo al lado del círculo
    datos: { flex: 1, marginLeft: 16 },
    nombreEncabezado: { fontFamily: FUENTES.regular, fontSize: 20, color: COLORS.blanco },
    emailEncabezado: { fontFamily: FUENTES.bold, fontSize: 14, color: COLORS.blanco, marginTop: 4 },

    // márgenes del cuerpo con los campos
    cuerpo: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },

    // banner de éxito o error
    banner: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    bannerTextos: { flex: 1, marginHorizontal: 8 },
    bannerTitulo: { fontFamily: FUENTES.bold, fontSize: 13 },
    bannerMensaje: { fontFamily: FUENTES.regular, fontSize: 13, marginTop: 2 },

    // espacio entre un campo y el siguiente
    grupo: { marginBottom: 20 },

    // título arriba de cada campo
    label: { fontFamily: FUENTES.regular, fontSize: 16, color: COLORS.azulLabel, marginBottom: 8 },

    // caja de cada campo (borde gris redondeado)
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: COLORS.borde,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 52,
        backgroundColor: COLORS.blanco,
    },

    // borde rojo cuando hay un error
    inputWrapError: { borderColor: COLORS.error },

    // texto que se escribe dentro del campo
    input: { flex: 1, fontFamily: FUENTES.regular, fontSize: 16, color: COLORS.texto },

    // espacio para el mensaje de error (igual que en las otras pantallas)
    errorWrap: { marginTop: 20 },

    // botón verde: Guardar cambios
    botonGuardar: {
        backgroundColor: COLORS.verde,
        borderRadius: 10,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    textoGuardar: { fontFamily: FUENTES.bold, fontSize: 18, color: COLORS.blanco },

    // botón con borde rojo: Cerrar sesión
    botonCerrar: {
        borderWidth: 1,
        borderColor: COLORS.rojo,
        borderRadius: 10,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 14,
        backgroundColor: COLORS.blanco,
    },
    textoCerrar: { fontFamily: FUENTES.bold, fontSize: 18, color: COLORS.rojo },
    });