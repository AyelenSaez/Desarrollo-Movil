    // useState sirve para guardar lo que el usuario escribe o elige
    import React, { useState } from "react";

    // Componentes de React Native que usamos para armar la pantalla
    import {
    View,                  // caja contenedora
    Text,                  // texto
    TextInput,             // campo donde se escribe
    TouchableOpacity,      // botón que se puede tocar
    Modal,                 // ventana que aparece encima (lista de opciones)
    FlatList,              // lista de opciones
    ScrollView,            // pantalla con scroll
    StyleSheet,            // estilos
    KeyboardAvoidingView,  // evita que el teclado tape los campos
    Platform,              // para saber si es iOS o Android
    Image,                 // para mostrar la foto de arriba
    } from "react-native";

    // Íconos, los mismos que usan Login y SignUp
    import { Ionicons } from "@expo/vector-icons";

    // Mismo componente de error que usan Login y SignUp
    import MensajeError from "../components/MensajeError";

    
    // react-hook-form: maneja los valores del formulario y sus errores
    // (Controller conecta cada campo con el formulario)
    import { useForm, Controller } from "react-hook-form";

    // Conecta react-hook-form con zod para que valide con nuestro esquema
    import { zodResolver } from "@hookform/resolvers/zod";

    // Esquema de validación del equipo (S4-07): nombre, tipo, cantidad y estado
    import { equipoFormSchema } from "../src/validations/equipoFormSchema";
    // Lista fija de tipos (Sonido, Iluminación, Infraestructura)
    import { LISTA_TIPOS_EQUIPO } from "../src/utils/tiposEquipos";

    // Colores tomados de SignUp/Login para que todas las pantallas se vean igual
    const COLORS = {
    azul: "#0b2f5b",
    verde: "#4e7246",
    borde: "#C9CED6",
    placeholder: "#9AA1AB",
    icono: "#6B7280",
    error: "#e05252",
    blanco: "#FFFFFF",
    };

    // Estados que aparecen en Figma para un equipo
    const ESTADOS = ["Disponible", "En uso", "En reparación"];

    // ---------------------------------------------------------------
    // CAMPO: texto con título arriba, borde y mensaje de error abajo.
    // Si le llega "error", el borde se pone rojo y se muestra el mensaje.
    // ---------------------------------------------------------------
    function Campo({ label, error, ...inputProps }) {
    return (
        <View style={styles.grupo}>
        {/* Título del campo */}
        <Text style={styles.label}>{label}</Text>

        {/* Caja del campo: borde rojo si hay error */}
        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
            <TextInput
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            {...inputProps} // value, onChangeText, placeholder, keyboardType, etc.
            />
        </View>

        {/* Mensaje de error (mismo componente que en SignUp) */}
        {error ? (
            <View style={styles.errorWrap}>
            <MensajeError mensaje={error} />
            </View>
        ) : null}
        </View>
    );
    }

    // ---------------------------------------------------------------
    // SELECTOR: desplegable para Tipo y Estado.
    // Muestra el valor elegido y, al tocarlo, abre una lista de opciones.
    // ---------------------------------------------------------------
    function Selector({ label, valor, opciones, placeholder, onChange, error }) {
    // Guarda si la lista de opciones está abierta o cerrada
    const [abierto, setAbierto] = useState(false);

    return (
        <View style={styles.grupo}>
        <Text style={styles.label}>{label}</Text>

        {/* Caja que se ve en la pantalla; al tocarla se abre la lista */}
        <TouchableOpacity
            style={[styles.inputWrap, error && styles.inputWrapError]}
            onPress={() => setAbierto(true)}
        >
            {/* Si ya eligió algo lo muestra, si no muestra el texto de ayuda */}
            <Text style={valor ? styles.valor : styles.textoPlaceholder}>
            {valor || placeholder}
            </Text>
            {/* Flechita del desplegable */}
            <Ionicons
            name="chevron-down"
            size={20}
            color={error ? COLORS.error : COLORS.icono}
            />
        </TouchableOpacity>

        {/* Mensaje de error si lo hay */}
        {error ? (
            <View style={styles.errorWrap}>
            <MensajeError mensaje={error} />
            </View>
        ) : null}

        {/* Lista de opciones: ventana encima de la pantalla */}
        <Modal
            transparent                              // deja ver el fondo
            animationType="fade"                     // aparece de a poco
            visible={abierto}                        // se muestra solo si "abierto" es true
            onRequestClose={() => setAbierto(false)} // botón atrás de Android la cierra
        >
            {/* Fondo oscuro: si se toca afuera, se cierra */}
            <TouchableOpacity
            style={styles.fondoModal}
            activeOpacity={1}
            onPress={() => setAbierto(false)}
            >
            {/* Cuadro blanco con las opciones */}
            <View style={styles.listaModal}>
                <FlatList
                data={opciones}                   // opciones a mostrar
                keyExtractor={(item) => item}     // identificador de cada una
                renderItem={({ item }) => (       // cómo se dibuja cada opción
                    <TouchableOpacity
                    style={styles.opcion}
                    onPress={() => {
                        onChange(item);    // guarda la opción elegida
                        setAbierto(false); // cierra la lista
                    }}
                    >
                    <Text style={styles.valor}>{item}</Text>
                    </TouchableOpacity>
                )}
                />
            </View>
            </TouchableOpacity>
        </Modal>
        </View>
    );
    }
    // ---------------------------------------------------------------
    // PANTALLA: formulario para agregar un equipo
    // "navigation" lo pasa React Navigation y sirve para volver atrás
    // ---------------------------------------------------------------
    export default function RegistroEquipo({ navigation }) {
    // useForm guarda lo que el usuario escribe o elige en los 4 campos.
    // resolver: usa el esquema de zod para validar al tocar "Agregar".
    // defaultValues: cómo arranca cada campo (vacío).
    const {
        control,                  // conecta cada campo con el formulario
        handleSubmit,             // valida y recién ahí ejecuta onSubmit
        getValues,       // lee el valor actual de un campo
        formState: { errors },    // errores de cada campo (si los hay)
    } = useForm({
        resolver: zodResolver(equipoFormSchema),
        defaultValues: { nombre: "", tipo: "", cantidad: "", estado: "" },
    });

    // Vuelve a la pantalla anterior (solo si hay una a la que volver)
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };
    
    // Devuelve el mensaje de error de un campo, o undefined si no tiene error.
    // S5-05: si el campo está vacío muestra "Este campo es obligatorio";
    // si tiene algo mal (ej. cantidad negativa) muestra el mensaje del esquema.
    const mensajeError = (campo) => {
        const error = errors[campo];
        if (!error) return undefined;
        const vacio = String(getValues(campo) ?? "").trim() === "";
        return vacio ? "Este campo es obligatorio" : error.message;
    };

    // Se ejecuta al tocar "Agregar", pero SOLO si todos los campos son válidos.
    // "datos" ya viene limpio (la cantidad llega como número).
    // El guardado en Firestore (S5-07) lo conecta Aldana acá adentro.
    const onSubmit = (datos) => {
        console.log("Datos del equipo:", datos);
    };

    return (
        // Evita que el teclado tape los campos en iOS
        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        {/* Scroll por si la pantalla es chica; mantiene los toques con el teclado abierto */}
        <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
        >
            {/* Foto fija de arriba */}
            <Image
            source={require("../assets/equipo.jpeg")}
            style={styles.imagen}
            />

            {/* Todo el formulario va dentro de esta caja con márgenes */}
            <View style={styles.formulario}>
            {/* Título de la pantalla (igual que en Figma) */}
            <Text style={styles.titulo}>Agregar nuevo equipo</Text>

                       {/* Nombre: texto libre, obligatorio */}
            <Controller
                control={control}
                name="nombre"
                render={({ field: { value, onChange, onBlur } }) => (
                <Campo
                    label="Nombre equipo"
                    placeholder="Ej: Consola 16 canales"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={mensajeError("nombre")}// borde rojo + mensaje si hay error
                />
                )}
            />

            {/* Tipo: desplegable con la lista fija de tipos */}
            <Controller
                control={control}
                name="tipo"
                render={({ field: { value, onChange } }) => (
                <Selector
                    label="Tipo de equipo"
                    valor={value}
                    opciones={LISTA_TIPOS_EQUIPO}
                    placeholder="Seleccioná un tipo"
                    onChange={onChange}
                    error={mensajeError("tipo")}
                />
                )}
            />

            {/* Cantidad: solo números enteros, 0 o más */}
            <Controller
                control={control}
                name="cantidad"
                render={({ field: { value, onChange, onBlur } }) => (
                <Campo
                    label="Cantidad"
                    placeholder="Ej: 4"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric" // teclado numérico
                    error={mensajeError("cantidad")}
                />
                )}
            />

            {/* Estado: desplegable con los estados */}
            <Controller
                control={control}
                name="estado"
                render={({ field: { value, onChange } }) => (
                <Selector
                    label="Estado"
                    valor={value}
                    opciones={ESTADOS}
                    placeholder="Seleccioná un estado"
                    onChange={onChange}
                    error={mensajeError("estado")}
                />
                )}
            />

            {/* Botón principal: Agregar */}
            <TouchableOpacity style={styles.boton} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.botonTexto}>Agregar</Text>
            </TouchableOpacity>

            {/* Cancelar: vuelve atrás sin guardar */}
            <TouchableOpacity onPress={volver}>
                <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>

        {/* Flecha para volver: va DESPUÉS del scroll para quedar encima de la foto */}
        <TouchableOpacity
            style={styles.flecha}
            onPress={volver}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="arrow-back" size={22} color={COLORS.azul} />
        </TouchableOpacity>
        </KeyboardAvoidingView>
    );
    }

    // ---------------------------------------------------------------
    // ESTILOS (copiados del estilo de SignUp)
    // ---------------------------------------------------------------
    const styles = StyleSheet.create({
    // Ocupa toda la pantalla con fondo blanco
    flex: { flex: 1, backgroundColor: COLORS.blanco },

    // Flecha de volver: circulito blanco sobre la foto
    flecha: {
        position: "absolute",
        top: 64,                          // para bajarla más, aumentá este número
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.blanco,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,                     // sombra en Android (y para quedar encima)
        shadowColor: "#000",              // sombra en iOS
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 10,
    },

    // Espacio al final de la pantalla
    contenido: { paddingBottom: 40 },

    // Foto de arriba: ocupa todo el ancho (más alta para bajar el formulario)
    imagen: { width: "100%", height: 280, resizeMode: "cover" },

    // Caja del formulario con márgenes; paddingTop separa el título de la foto
    formulario: { paddingHorizontal: 20, paddingTop: 36 },

    // Título grande en azul
    titulo: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.azul,
        marginBottom: 24,
    },

    // Espacio entre un campo y el siguiente
    grupo: { marginBottom: 14 },

    // Título chico arriba de cada campo
    label: { fontSize: 14, color: COLORS.azul, marginBottom: 6 },

    // Caja de cada campo: borde gris redondeado
    inputWrap: {
        flexDirection: "row",            // contenido a la izquierda, flecha a la derecha
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: COLORS.borde,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },

    // Borde rojo cuando hay un error
    inputWrapError: { borderColor: COLORS.error },

    // Texto que se escribe dentro del campo
    input: { flex: 1, fontSize: 15, color: "#111827" },

    // Texto del valor elegido en un selector
    valor: { fontSize: 15, color: "#111827" },

    // Texto de ayuda en gris cuando todavía no se eligió nada
    textoPlaceholder: { fontSize: 15, color: COLORS.placeholder },

    // Espacio para el mensaje de error (igual que en SignUp)
    errorWrap: { marginTop: 20 },

    // Fondo oscuro semitransparente detrás de la lista de opciones
    fondoModal: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 32,
    },

    // Cuadro blanco con las opciones
    listaModal: { backgroundColor: COLORS.blanco, borderRadius: 12, padding: 8 },

    // Cada opción de la lista
    opcion: { paddingVertical: 14, paddingHorizontal: 12 },

    // Botón "Agregar": verde, centrado y menos ancho (70% de la pantalla)
    boton: {
        backgroundColor: COLORS.verde,
        borderRadius: 8,
        height: 48,
        width: "70%",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },

    // Texto del botón
    botonTexto: { color: COLORS.blanco, fontSize: 16, fontWeight: "700" },

    // Texto "Cancelar"
    cancelar: {
        textAlign: "center",
        color: COLORS.azul,
        fontSize: 15,
        marginTop: 16,
    },
    });
    