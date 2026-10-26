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
    } from "react-native";

    // Íconos, los mismos que usan Login y SignUp
    import { Ionicons } from "@expo/vector-icons";

    // Mismo componente de error que usan Login y SignUp
    import MensajeError from "../components/MensajeError";

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
    // Un estado por cada campo del formulario
    const [nombre, setNombre] = useState("");
    const [tipo, setTipo] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [estado, setEstado] = useState("");

    // Se ejecuta al tocar "Agregar".
    // Por ahora solo junta los datos y los muestra en la consola.
    // La validación (S5-05 y S5-06) y el guardado en Firestore (S5-07)
    // los conectan después los compañeros.
    const handleAgregar = () => {
        const datos = { nombre, tipo, cantidad, estado };
        console.log("Datos del equipo:", datos);
    };

    return (
        // Evita que el teclado tape los campos en iOS
        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        {/* Flecha para volver: queda fija arriba a la izquierda */}
        <TouchableOpacity
            style={styles.flecha}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="arrow-back" size={24} color={COLORS.azul} />
        </TouchableOpacity>

        {/* Scroll por si la pantalla es chica; mantiene los toques con el teclado abierto */}
        <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
        >
            {/* Título de la pantalla (igual que en Figma) */}
            <Text style={styles.titulo}>Agregar nuevo equipo</Text>

            {/* Nombre: texto libre */}
            <Campo
            label="Nombre equipo"
            placeholder="Ej: Consola 16 canales"
            value={nombre}
            onChangeText={setNombre}
            />

            {/* Tipo: desplegable con la lista fija de tipos */}
            <Selector
            label="Tipo de equipo"
            valor={tipo}
            opciones={LISTA_TIPOS_EQUIPO}
            placeholder="Seleccioná un tipo"
            onChange={setTipo}
            />

            {/* Cantidad: solo números */}
            <Campo
            label="Cantidad"
            placeholder="Ej: 4"
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="numeric" // teclado numérico
            />

            {/* Estado: desplegable con los estados */}
            <Selector
            label="Estado"
            valor={estado}
            opciones={ESTADOS}
            placeholder="Seleccioná un estado"
            onChange={setEstado}
            />

            {/* Botón principal: Agregar */}
            <TouchableOpacity style={styles.boton} onPress={handleAgregar}>
            <Text style={styles.botonTexto}>Agregar</Text>
            </TouchableOpacity>

            {/* Cancelar: vuelve atrás sin guardar */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
    );
    }

    // ---------------------------------------------------------------
    // ESTILOS (copiados del estilo de SignUp)
    // ---------------------------------------------------------------
    const styles = StyleSheet.create({
    // Ocupa toda la pantalla con fondo blanco
    flex: { flex: 1, backgroundColor: COLORS.blanco },

    // Flecha de volver fija arriba a la izquierda
    flecha: { position: "absolute", top: 40, left: 20, zIndex: 1 },

    // Márgenes internos y centrado vertical del formulario
    contenido: {
        flexGrow: 1,               // ocupa toda la altura de la pantalla
        justifyContent: "center",  // centra el formulario verticalmente
        paddingHorizontal: 20,
        paddingTop: 72,            // deja lugar para la flecha de arriba
        paddingBottom: 32,
    },

    // Título grande en azul
    titulo: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.azul,
        marginBottom: 20,
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