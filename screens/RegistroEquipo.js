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

    
    // react-hook-form: maneja los valores del formulario y sus errores
    // (Controller conecta cada campo con el formulario)
    import { useForm, Controller } from "react-hook-form";

    // Conecta react-hook-form con zod para que valide con nuestro esquema
    import { zodResolver } from "@hookform/resolvers/zod";

    // Esquema de validación del equipo (S4-07): nombre, tipo, cantidad y estado
    import { equipoFormSchema } from "../src/validations/equipoFormSchema";
    // Lista fija de tipos (Sonido, Iluminación, Infraestructura)
    import { LISTA_TIPOS_EQUIPO } from "../src/utils/tiposEquipos";
    // avisos en pantalla (exito o error)
    import { useNotificacion } from "../components/Notificacion";
    // funciones de firestore para equipos, tipos y estados
    import {
    registrarEquipo,
    cargarTiposIniciales,
    crearTipoEquipo,
    obtenerEstadosEquipo,
    crearEstadoEquipo,
    } from "../src/services/equipoService";

    // busca en una lista el id del elemento que tiene ese nombre (sin importar mayusculas ni espacios)
    const buscarIdPorNombre = (lista, campoId, campoNombre, nombre) => {
    const buscado = String(nombre ?? "").trim().toLowerCase();
    const encontrado = lista.find(
        (item) => String(item[campoNombre] ?? "").trim().toLowerCase() === buscado
    );
    return encontrado ? encontrado[campoId] : undefined;
    };

    // Colores tomados de SignUp/Login para que todas las pantallas se vean igual
    export const COLORS = {
    azul: "#0b2f5b",
    verde: "#4e7246",
    borde: "#C9CED6",
    placeholder: "#9AA1AB",
    icono: "#6B7280",
    error: "#e05252",
    blanco: "#FFFFFF",
    };

    // Estados que aparecen en Figma para un equipo
    export const ESTADOS = ["Disponible", "En uso", "En reparación"];

    // ---------------------------------------------------------------
    // CAMPO: texto con título arriba, borde y mensaje de error abajo.
    // Si le llega "error", el borde se pone rojo y se muestra el mensaje.
    // ---------------------------------------------------------------
    export function Campo({ label, error, ...inputProps }) {
    return (
        <View style={styles.grupo}>
        {/* Título del campo */}
        <Text style={styles.label}>{label}</Text>

        {/* caja de los campos, si hay error se pone roja */}
        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
            <TextInput
            style={styles.input}
            placeholderTextColor={COLORS.placeholder}
            {...inputProps} 
            />
        </View>

        {/* mensaje de error */}
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
    export function Selector({ label, valor, opciones, placeholder, onChange, error }) {
    // Guarda si la lista de opciones está abierta o cerrada
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
        {/* flechita desplegable */}
            <Ionicons
            name="chevron-down"
            size={20}
            color={error ? COLORS.error : COLORS.icono}
            />
        </TouchableOpacity>

        {/* mensaje de error */}
        {error ? (
            <View style={styles.errorWrap}>
            <MensajeError mensaje={error} />
            </View>
        ) : null}

        {/* lista de opciones */}
        <Modal
            transparent                              // deja ver el fondo
            animationType="fade"                     // aparece de a poco
            visible={abierto}                        // se muestra solo si "abierto" es true
            onRequestClose={() => setAbierto(false)} // boton atras de android la cierra
        >
            {/* fondo oscuro */}
            <TouchableOpacity
            style={styles.fondoModal}
            activeOpacity={1}
            onPress={() => setAbierto(false)}
            >
          {/* opciones en un cuadro blanco */}
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

    const { mostrarNotificacion } = useNotificacion();
    // true mientras se guarda, para no guardar dos veces si tocan el boton de nuevo
    const [guardando, setGuardando] = useState(false);

    // Vuelve a la pantalla anterior 
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
    // guardado en firestore (S5-07): el formulario tiene el nombre del tipo y del estado,
    // pero en la base se guardan sus id, asi que primero se buscan (o se crean si no existen)
    const onSubmit = async (datos) => {
        if (guardando) return;
        setGuardando(true);
        try {
        // tipos: si la coleccion esta vacia carga sonido, iluminacion e infraestructura
        const tipos = await cargarTiposIniciales();
        if (!tipos.ok) return mostrarNotificacion(tipos.mensaje, "error");
        let id_tipoeq = buscarIdPorNombre(tipos.datos, "id_tipoeq", "nombre_tipoeq", datos.tipo);
        if (!id_tipoeq) {
            const nuevoTipo = await crearTipoEquipo({ nombre_tipoeq: datos.tipo });
            if (!nuevoTipo.ok) return mostrarNotificacion(nuevoTipo.mensaje, "error");
            id_tipoeq = nuevoTipo.dato.id_tipoeq;
        }

        // estados: si el estado elegido todavia no existe en la base, se crea
        const estados = await obtenerEstadosEquipo();
        if (!estados.ok) return mostrarNotificacion(estados.mensaje, "error");
        let id_estadoeq = buscarIdPorNombre(estados.datos, "id_estadoeq", "nombre_estadoeq", datos.estado);
        if (!id_estadoeq) {
            const nuevoEstado = await crearEstadoEquipo({ nombre_estadoeq: datos.estado });
            if (!nuevoEstado.ok) return mostrarNotificacion(nuevoEstado.mensaje, "error");
            id_estadoeq = nuevoEstado.dato.id_estadoeq;
        }

        // guarda el equipo (registrarEquipo tambien revisa que no este duplicado)
        const resultado = await registrarEquipo({
            id_tipoeq,
            id_estadoeq,
            nombre_equipo: datos.nombre.trim(),
            cantidad_equipo: Number(datos.cantidad),
        });

        if (resultado.ok) {
            mostrarNotificacion(resultado.mensaje, "exito");
            volver(); // vuelve al listado, que se recarga solo
        } else {
            mostrarNotificacion(resultado.mensaje, "error");
        }
        } finally {
        setGuardando(false);
        }
    };

    return (
        // para que el teclado tape los campos en ios
        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        {/* scroll por si la pantalla es chica */}
        <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
        >
        {/* imagen de arriba */}
            <Image
            source={require("../assets/equipo.jpeg")}
            style={styles.imagen}
            />

        {/* formulario */}
            <View style={styles.formulario}>

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
            <TouchableOpacity
                style={[styles.boton, guardando && { opacity: 0.6 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={guardando}
            >
                <Text style={styles.botonTexto}>{guardando ? "Guardando..." : "Agregar"}</Text>
            </TouchableOpacity>

         {/* Cancelar */}
            <TouchableOpacity onPress={volver}>
                <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>

        {/* Flecha para volver hacia atras, encima de la imagen */}
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
    export const styles = StyleSheet.create({
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