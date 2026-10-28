    import React, { useState } from "react";

    // componentes de React Native que use para armar la pantalla
    import {
    View,                  // caja contenedora
    Text,                  // texto
    TextInput,             // campo donde se escribe
    TouchableOpacity,      // botón que se puede tocar
    Modal,                 // lista de opciones, osea la ventana que aparece encima 
    FlatList,              // lista de opciones
    ScrollView,            // pantalla con scroll
    StyleSheet,            // estilos
    KeyboardAvoidingView,  // evita que el teclado tape los campos
    Platform,              // para saber si es iOS o Android
    Image,                 // para mostrar la foto de arriba
    } from "react-native";

    // iconos
    import { Ionicons } from "@expo/vector-icons";

    // mismo componente de error que usan login y registro
    import MensajeError from "../components/MensajeError";

    // lista fija de tipos (Sonido, Iluminación, Infraestructura)
    import { LISTA_TIPOS_EQUIPO } from "../src/utils/tiposEquipos";

    // colores 
    const COLORS = {
    azul: "#0b2f5b",
    verde: "#4e7246",
    borde: "#C9CED6",
    placeholder: "#9AA1AB",
    icono: "#6B7280",
    error: "#e05252",
    blanco: "#FFFFFF",
    };

    // estados de los equipos
    const ESTADOS = ["Disponible", "En uso", "En reparación"];

    // CAMPOS
    function Campo({ label, error, ...inputProps }) {
    return (
        <View style={styles.grupo}>
        {/* Título del campo */}
        <Text style={styles.label}>{label}</Text>

        //caja de los campos, si hay error se pone roja
        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
            <TextInput
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            {...inputProps} 
            />
        </View>

        //mensaje de error
        {error ? (
            <View style={styles.errorWrap}>
            <MensajeError mensaje={error} />
            </View>
        ) : null}
        </View>
    );
    }

    // SELECTOR

    function Selector({ label, valor, opciones, placeholder, onChange, error }) {
    // guarda si la lista de opciones está abierta o cerrada
    const [abierto, setAbierto] = useState(false);

    return (
        <View style={styles.grupo}>
        <Text style={styles.label}>{label}</Text>

        <TouchableOpacity
            style={[styles.inputWrap, error && styles.inputWrapError]}
            onPress={() => setAbierto(true)}
        >
            <Text style={valor ? styles.valor : styles.textoPlaceholder}>
            {valor || placeholder}
            </Text>
        //flechita desplegable
            <Ionicons
            name="chevron-down"
            size={20}
            color={error ? COLORS.error : COLORS.icono}
            />
        </TouchableOpacity>

        //mensaje de error
        {error ? (
            <View style={styles.errorWrap}>
            <MensajeError mensaje={error} />
            </View>
        ) : null}

        //lista de opciones
        <Modal
            transparent                              // deja ver el fondo
            animationType="fade"                     // aparece de a poco
            visible={abierto}                        // se muestra solo si "abierto" es true
            onRequestClose={() => setAbierto(false)} // boton atras de android la cierra
        >
            //fondo oscuro
            <TouchableOpacity
            style={styles.fondoModal}
            activeOpacity={1}
            onPress={() => setAbierto(false)}
            >
          //opciones en un cuadro blanco
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

    // Formulario para registrar un equipo

    export default function RegistroEquipo({ navigation }) {
    // Un estado por cada campo del formulario
    const [nombre, setNombre] = useState("");
    const [tipo, setTipo] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [estado, setEstado] = useState("");

    // Vuelve a la pantalla anterior 
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    // Se ejecuta al tocar "Agregar".
    // Por ahora solo junta los datos y los muestra en la consola.
    const handleAgregar = () => {
        const datos = { nombre, tipo, cantidad, estado };
        console.log("Datos del equipo:", datos);
    };

    return (
        // para que el teclado tape los campos en ios
        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        //scroll por si la pantalla es chica
        <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
        >
        //imagen de arriba
            <Image
            source={require("../assets/equipo.jpeg")}
            style={styles.imagen}
            />

        //formulario
            <View style={styles.formulario}>

            <Text style={styles.titulo}>Agregar nuevo equipo</Text>

            //nombre del equipo
            <Campo
                label="Nombre equipo"
                placeholder="Ej: Consola 16 canales"
                value={nombre}
                onChangeText={setNombre}
            />

        //desplegable con la lista de tipos 
            <Selector
                label="Tipo de equipo"
                valor={tipo}
                opciones={LISTA_TIPOS_EQUIPO}
                placeholder="Seleccioná un tipo"
                onChange={setTipo}
            />

         // en cantidad para que solo aparezcan números 
            <Campo
                label="Cantidad"
                placeholder="Ej: 4"
                value={cantidad}
                onChangeText={setCantidad}
                keyboardType="numeric" // teclado numérico
            />

        // Estado: desplegable con los estados 
            <Selector
                label="Estado"
                valor={estado}
                opciones={ESTADOS}
                placeholder="Seleccioná un estado"
                onChange={setEstado}
            />

        //Botón principal para agregar 
            <TouchableOpacity style={styles.boton} onPress={handleAgregar}>
                <Text style={styles.botonTexto}>Agregar</Text>
            </TouchableOpacity>

         // Cancelar
            <TouchableOpacity onPress={volver}>
                <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>

        // Flecha para volver hacia atras, encima de la imagen 
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


// ESTILOS 

    const styles = StyleSheet.create({
    // Ocupa toda la pantalla con fondo blanco
    flex: { flex: 1, backgroundColor: COLORS.blanco },

    // Flecha para volver hacia atras 
    flecha: {
        position: "absolute",
        top: 64,                          
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.blanco,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,                     // sombra en android 
        shadowColor: "#000",              // sombra en iOS
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 10,
    },

    // espacio al final de la pantalla
    contenido: { paddingBottom: 40 },

    // imagen 
    imagen: { width: "100%", height: 280, resizeMode: "cover" },

    // separacion del título de la foto
    formulario: { paddingHorizontal: 20, paddingTop: 36 },

    // titulo grande en azul
    titulo: {
        fontSize: 22,
        fontWeight: "700",
        color: COLORS.azul,
        marginBottom: 24,
    },

    // espacio entre un campo y el siguiente
    grupo: { marginBottom: 14 },

    // titulo pequeño arriba de cada campo
    label: { fontSize: 14, color: COLORS.azul, marginBottom: 6 },

    // caja de cada campo osea el borde gris redondeado
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

    // borde rojo cuando hay un error
    inputWrapError: { borderColor: COLORS.error },

    // texto que se escribe dentro del campo
    input: { flex: 1, fontSize: 15, color: "#111827" },

    // texto del valor elegido en un selector
    valor: { fontSize: 15, color: "#111827" },

    // placeholder cuando todavía no se eligió nada
    textoPlaceholder: { fontSize: 15, color: COLORS.placeholder },

    // fspacio para el mensaje de error 
    errorWrap: { marginTop: 20 },

    // fondo oscuro medio transparente detras de la lista de opciones
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

    // Boton Agregar
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

    // texto del botoon
    botonTexto: { color: COLORS.blanco, fontSize: 16, fontWeight: "700" },

    // texto Cancelar
    cancelar: {
        textAlign: "center",
        color: COLORS.azul,
        fontSize: 15,
        marginTop: 16,
    },
    });