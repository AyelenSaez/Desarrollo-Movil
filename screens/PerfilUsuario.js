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
    Image,                 // muestra la foto de perfil elegida (S7-07)
    } from "react-native";

    // S7-07: abre la galería del teléfono para elegir la foto de perfil
    import * as ImagePicker from "expo-image-picker";
    // AsyncStorage: guarda la foto elegida en el teléfono para que siga al volver a entrar
    import AsyncStorage from "@react-native-async-storage/async-storage";
    // auth: usuario con sesión iniciada (cada usuario tiene su propia foto guardada)
    import { auth } from "../src/config/firebaseConfig";

    // Clave con la que se guarda la foto de cada usuario en el teléfono
    const claveFoto = () => `fotoPerfil_${auth.currentUser?.uid ?? "sin-sesion"}`;
 
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
    import { obtenerPerfil, modificarPerfil } from "../src/services/perfilService";
    // react-hook-form maneja el formulario y zodResolver lo conecta con el esquema zod del perfil (S6-04)
    import { useForm, Controller } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { perfilSchema } from "../src/validations/perfilSchema";
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
 
    // S7-04: useForm guarda lo que el usuario escribe en los campos.
    // resolver: valida con el esquema zod del perfil al tocar "Guardar cambios".
    // defaultValues: los campos arrancan vacíos y se completan con los datos de Firestore.
    const {
        control,                  // conecta cada campo con el formulario
        handleSubmit,             // valida y recién ahí ejecuta handleGuardar
        getValues,                // lee el valor actual de un campo
        reset,                    // carga los datos del perfil en los campos
        watch,                    // sigue lo que se escribe (el encabezado lo muestra)
        formState: { errors },    // errores de cada campo (si los hay)
    } = useForm({
        resolver: zodResolver(perfilSchema),
        defaultValues: { nombre: "", email: "", telefono: "" },
    });
 
    // nombre y correo actuales, para el encabezado azul
    const nombre = watch("nombre");
    const email = watch("email");
 
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
            reset({
            nombre: resultado.datos.nombre,
            email: resultado.datos.email,
            telefono: resultado.datos.telefono,
            });
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
    }, [reset]);
    // aviso que se muestra arriba del formulario: { tipo: "exito" | "error", mensaje } o null
    const [aviso, setAviso] = useState(null);
 
    // true mientras se guardan los cambios: deshabilita el botón para no guardar dos veces (S7-05)
    const [guardando, setGuardando] = useState(false);

    // S7-07: dirección (uri) de la foto elegida en la galería (null = se muestra la inicial)
    const [fotoPerfil, setFotoPerfil] = useState(null);

    // Al abrir la pantalla: si el usuario ya había elegido una foto, se vuelve a mostrar
    useEffect(() => {
        AsyncStorage.getItem(claveFoto())
            .then((uri) => {
                if (uri) setFotoPerfil(uri);
            })
            .catch((error) => console.log("No se pudo leer la foto guardada:", error));
    }, []);

    // S7-07: al tocar la cámara del círculo abre la galería para elegir una foto.
    // allowsEditing + aspect [1, 1]: deja recortarla cuadrada para que entre bien en el círculo.
    const elegirFoto = async () => {
        try {
            const resultado = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"], // solo fotos, no videos
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,           // un poco comprimida para que pese menos
            });
            // canceled = el usuario cerró la galería sin elegir nada
            if (resultado.canceled) return;
            const uri = resultado.assets[0].uri;
            setFotoPerfil(uri);
            // la guarda en el teléfono para que siga ahí la próxima vez que entre
            await AsyncStorage.setItem(claveFoto(), uri);
        } catch (error) {
            console.log("No se pudo abrir la galería:", error);
            setAviso({ tipo: "error", mensaje: "No se pudo abrir la galería. Intente de nuevo." });
        }
    };
 
    // Devuelve el mensaje de error de un campo, o undefined si no tiene error (S7-04).
    // Si el campo está vacío muestra "Este campo es obligatorio" (igual que registro y equipos);
    // si tiene algo mal (ej. teléfono con letras) muestra el mensaje del esquema.
    const mensajeError = (campo) => {
        const error = errors[campo];
        if (!error) return undefined;
        const vacio = String(getValues(campo) ?? "").trim() === "";
        return vacio ? "Este campo es obligatorio" : error.message;
    };
 
    // letra que va dentro del círculo (primera letra del nombre)
    const inicial = nombre.trim().charAt(0).toUpperCase() || "?";
 
    // vuelve a la pantalla anterior
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };
 
    // Se ejecuta al tocar "Guardar cambios", pero SOLO si todos los campos son válidos (S7-04).
    // "datos" ya viene validado y sin espacios de más.
    // S7-05: guarda con modificarPerfil y muestra el banner verde (éxito) o el rojo (error).
    const handleGuardar = async (datos) => {
        if (guardando) return;       // por si tocan el botón dos veces seguidas
        setAviso(null);              // saca el aviso anterior
        setGuardando(true);
 
        // modificarPerfil no lanza excepciones: devuelve { ok: true, datos } o { ok: false, mensaje }
        const resultado = await modificarPerfil({
            nombre: datos.nombre,
            telefono: datos.telefono,
        });
 
        setGuardando(false);
        if (resultado.ok) {
            setAviso({ tipo: "exito", mensaje: "Los cambios se guardaron correctamente." });
        } else {
            setAviso({ tipo: "error", mensaje: "No se guardaron los cambios. Intente de nuevo." });
        }
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
            {/* S7-07: círculo con la foto elegida (o la inicial si no hay foto).
                Tocar el círculo o la cámara abre la galería. */}
            <TouchableOpacity onPress={elegirFoto} accessibilityLabel="Cambiar foto de perfil">
                <View style={styles.avatar}>
                {fotoPerfil ? (
                    <Image source={{ uri: fotoPerfil }} style={styles.avatarFoto} />
                ) : (
                    <Text style={styles.avatarLetra}>{inicial}</Text>
                )}
                </View>
                <View style={styles.camara}>
                <Ionicons name="camera-outline" size={16} color={COLORS.azul} />
                </View>
            </TouchableOpacity>
 
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
        >
            {/* banner rojo si falló la carga del perfil (S7-03) */}
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
            <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, value } }) => (
                <CampoPerfil
                label="Nombre completo"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                error={mensajeError("nombre")}
                />
            )}
            />
 
            {/* Correo electrónico */}
            <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
                <CampoPerfil
                label="Correo electrónico"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={mensajeError("email")}
                />
            )}
            />
 
            {/* Teléfono */}
            <Controller
            control={control}
            name="telefono"
            render={({ field: { onChange, value } }) => (
                <CampoPerfil
                label="Teléfono"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={mensajeError("telefono")}
                />
            )}
            />
 
            {/* botón verde: Guardar cambios */}
            <TouchableOpacity
            style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
            onPress={handleSubmit(handleGuardar)}
            disabled={guardando}
            >
            <Text style={styles.textoGuardar}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
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
        overflow: "hidden", // recorta la foto en forma de círculo
    },
    // foto de perfil: ocupa todo el círculo
    avatarFoto: { width: "100%", height: "100%" },
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
 
    // botón apagado mientras se guardan los cambios
    botonDeshabilitado: { opacity: 0.6 },
 
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