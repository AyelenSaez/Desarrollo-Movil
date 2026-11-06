// Pantalla para registrar un equipo nuevo (fiel a Figma: "Agregar equipos").
// Además exporta Campo, Selector, FormularioEquipo, COLORS, ESTADOS y styles,
// que reutiliza la pantalla ModificarEquipo.

// React y useState: guardar valores de la pantalla (guardando, lista abierta).
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

    // margenes seguros (notch, barra de estado)
    import { useSafeAreaInsets } from "react-native-safe-area-context";

    // iconos
    import { Ionicons } from "@expo/vector-icons";

    // mismo componente de error que usan login y registro
    import MensajeError from "../components/MensajeError";

    // colores de las pantallas de equipos (medidos de Figma)
    import { COLORES_EQUIPO } from "../components/EquipoVisual";
    // fuente Work Sans
    import { FUENTES } from "../src/theme/fuentes";

    // react-hook-form: maneja los valores del formulario y sus errores
    // (Controller conecta cada campo con el formulario)
    import { useForm, Controller } from "react-hook-form";

    // Conecta react-hook-form con zod para que valide con nuestro esquema
    import { zodResolver } from "@hookform/resolvers/zod";

    // Esquema de validación del equipo (S4-07): nombre, tipo, cantidad, estado y descripción
    import { equipoFormSchema } from "../src/validations/equipoFormSchema";
    // Lista fija de tipos (Sonido, Iluminación, Infraestructura)
    import { LISTA_TIPOS_EQUIPO } from "../src/utils/tiposEquipos";
    // avisos en pantalla (exito o error)
    import { useNotificacion } from "../components/Notificacion";
    // funciones de firestore para equipos, tipos y estados
    import {
    registrarEquipo,       // guarda el equipo (verifica que no esté duplicado)
    cargarTiposIniciales,  // trae los tipos (y los crea si la colección está vacía)
    crearTipoEquipo,       // crea un tipo si todavía no existe
    obtenerEstadosEquipo,  // trae los estados guardados
    crearEstadoEquipo,     // crea un estado si todavía no existe
    } from "../src/services/equipoService";

    // busca en una lista el id del elemento que tiene ese nombre (sin importar mayusculas ni espacios)
    const buscarIdPorNombre = (lista, campoId, campoNombre, nombre) => {
    const buscado = String(nombre ?? "").trim().toLowerCase();
    const encontrado = lista.find(
        (item) => String(item[campoNombre] ?? "").trim().toLowerCase() === buscado
    );
    return encontrado ? encontrado[campoId] : undefined;
    };

    // Colores del formulario (los de Figma, ver EquipoVisual)
    export const COLORS = {
    ...COLORES_EQUIPO,
    placeholder: "#9AA1AB",
    error: "#e05252",
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
            size={22}
            color={error ? COLORS.error : COLORS.azul}
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

    // ---------------------------------------------------------------
    // FOTO DE ARRIBA y FLECHA FLOTANTE: las usan Agregar y Editar.
    // La flecha va después del ScrollView para quedar fija encima de la foto.
    // ---------------------------------------------------------------
    export function FotoCabecera() {
    return <Image source={require("../assets/equipo.jpeg")} style={styles.imagen} />;
    }

    export function FlechaVolver({ onPress }) {
    const insets = useSafeAreaInsets();
    return (
        <TouchableOpacity
        style={[styles.flechaFlotante, { top: insets.top + 16 }]}
        onPress={onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="Volver"
        >
        <Ionicons name="arrow-back" size={22} color={COLORS.azul} />
        </TouchableOpacity>
    );
    }

    // ---------------------------------------------------------------
    // FORMULARIO: los 5 campos del equipo (lo usan Agregar y Editar).
    // control y mensajeError vienen del useForm de cada pantalla.
    // ---------------------------------------------------------------
    export function FormularioEquipo({ control, mensajeError }) {
    return (
        <>
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
                error={mensajeError("nombre")} // borde rojo + mensaje si hay error
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

        {/* Descripción: texto libre, opcional */}
        <Controller
            control={control}
            name="descripcion"
            render={({ field: { value, onChange, onBlur } }) => (
            <Campo
                label="Descripción"
                placeholder="Ej: Original"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={mensajeError("descripcion")}
            />
            )}
        />
        </>
    );
    }

    // Formulario para registrar un equipo

    export default function RegistroEquipo({ navigation }) {
    // useForm guarda lo que el usuario escribe o elige en los campos.
    // resolver: usa el esquema de zod para validar al tocar "Agregar".
    // defaultValues: cómo arranca cada campo (vacío).
    const {
        control,                  // conecta cada campo con el formulario
        handleSubmit,             // valida y recién ahí ejecuta onSubmit
        getValues,       // lee el valor actual de un campo
        formState: { errors },    // errores de cada campo (si los hay)
    } = useForm({
        resolver: zodResolver(equipoFormSchema),
        defaultValues: { nombre: "", tipo: "", cantidad: "", estado: "", descripcion: "" },
    });

    // función para mostrar avisos de éxito o error
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
            descripcion_equipo: datos.descripcion ?? "",
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
        // para que el teclado no tape los campos en ios
        <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
        {/* scroll por si la pantalla es chica */}
        <ScrollView
            contentContainerStyle={styles.contenidoConFoto}
            keyboardShouldPersistTaps="handled"
        >
            {/* imagen de arriba */}
            <FotoCabecera />

            {/* formulario */}
            <View style={styles.formulario}>
            <Text style={[styles.titulo, styles.tituloAngosto]}>Agregar nuevo equipo</Text>

            <FormularioEquipo control={control} mensajeError={mensajeError} />

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
        <FlechaVolver onPress={volver} />
        </KeyboardAvoidingView>
    );
    }

    // ---------------------------------------------------------------
    // ESTILOS (medidas de Figma, pantalla de 430 de ancho)
    // ---------------------------------------------------------------
    export const styles = StyleSheet.create({
    // Ocupa toda la pantalla con el fondo de Figma
    flex: { flex: 1, backgroundColor: COLORS.fondo },

    // márgenes de los costados y espacio al final
    contenido: { paddingHorizontal: 20, paddingBottom: 40 },

    // Flecha para volver hacia atras (arriba a la izquierda, sin fondo)
    flecha: { alignSelf: "flex-start", marginBottom: 8 },

    // pantallas con foto: la foto ocupa todo el ancho, el formulario lleva los márgenes
    contenidoConFoto: { paddingBottom: 40 },
    imagen: { width: "100%", height: 280, resizeMode: "cover" },
    formulario: { paddingHorizontal: 20, paddingTop: 36 },

    // flecha en un círculo blanco con sombra, flotando encima de la foto
    flechaFlotante: {
        position: "absolute",
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

    // titulo grande en azul
    titulo: {
        fontFamily: FUENTES.bold,
        fontSize: 30,
        lineHeight: 45,
        letterSpacing: 0.9,
        color: COLORS.azul,
        marginBottom: 36,
    },

    // en Figma "Agregar nuevo equipo" ocupa dos renglones
    tituloAngosto: { maxWidth: 260 },

    // espacio entre un campo y el siguiente
    grupo: { marginBottom: 26 },

    // titulo arriba de cada campo
    label: { fontFamily: FUENTES.regular, fontSize: 20, color: COLORS.azulLabel, marginBottom: 12 },

    // caja de cada campo osea el borde gris redondeado
    inputWrap: {
        flexDirection: "row",            // contenido a la izquierda, flecha a la derecha
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: COLORS.borde,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingRight: 16,
        height: 60,
        backgroundColor: COLORS.blanco,
    },

    // borde rojo cuando hay un error
    inputWrapError: { borderColor: COLORS.error },

    // texto que se escribe dentro del campo
    input: { flex: 1, fontFamily: FUENTES.regular, fontSize: 20, color: COLORS.texto },

    // texto del valor elegido en un selector
    valor: { fontFamily: FUENTES.regular, fontSize: 20, color: COLORS.texto },

    // placeholder cuando todavía no se eligió nada
    textoPlaceholder: { fontFamily: FUENTES.regular, fontSize: 20, color: COLORS.placeholder },

    // espacio para el mensaje de error
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

    // Boton principal (Agregar / Guardar cambios / Editar equipo)
    boton: {
        backgroundColor: COLORS.azul,
        borderRadius: 10,
        height: 60,
        width: "100%",
        maxWidth: 350,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
    },

    // texto del botoon
    botonTexto: { fontFamily: FUENTES.bold, color: COLORS.blanco, fontSize: 24, letterSpacing: 0.72 },

    // texto Cancelar
    cancelar: {
        fontFamily: FUENTES.regular,
        textAlign: "center",
        color: COLORS.azulLabel,
        fontSize: 24,
        marginTop: 27,
    },
    });
