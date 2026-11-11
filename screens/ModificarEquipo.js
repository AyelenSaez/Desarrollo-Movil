// Pantalla para modificar un equipo (fiel a Figma: "Editar equipos").
// useEffect: para cargar los datos del equipo apenas se abre la pantalla
// useState: guarda si está cargando y si hubo un error
import React, { useEffect, useState } from "react";

// Componentes de React Native que usamos para armar la pantalla
import {
    View,                  // caja contenedora
    Text,                  // texto
    TouchableOpacity,      // botón que se puede tocar
    ScrollView,            // pantalla con scroll
    KeyboardAvoidingView,  // evita que el teclado tape los campos
    Platform,              // para saber si es iOS o Android
    ActivityIndicator,     // circulito de carga
} from "react-native";

// Mismo componente de error que usan las demás pantallas
import MensajeError from "../components/MensajeError";

// react-hook-form + zod: mismo formulario y esquema que el registro
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { equipoFormSchema } from "../src/validations/equipoFormSchema";

// Funciones de Firestore para equipos, tipos y estados
import {
    obtenerDetalleEquipo,  // trae el equipo por ID con los nombres de su tipo y estado
    modificarEquipo,       // guarda los cambios (función del Sprint 4, verifica duplicados)
    cargarTiposIniciales,  // trae los tipos (y los crea si la colección está vacía)
    crearTipoEquipo,       // crea un tipo si todavía no existe
    obtenerEstadosEquipo,  // trae los estados guardados
    crearEstadoEquipo,     // crea un estado si todavía no existe
} from "../src/services/equipoService";

// Avisos en pantalla de éxito o error (el mismo componente que usa Agregar equipo)
import { useNotificacion } from "../components/Notificacion";

// Mismos campos, colores, foto, flecha y estilos que la pantalla de registro
import { COLORS, FormularioEquipo, FotoCabecera, FlechaVolver, styles } from "./RegistroEquipo";

// Busca en una lista el id del elemento que tiene ese nombre (sin importar mayúsculas ni espacios)
const buscarIdPorNombre = (lista, campoId, campoNombre, nombre) => {
    const buscado = String(nombre ?? "").trim().toLowerCase();
    const encontrado = lista.find(
        (item) => String(item[campoNombre] ?? "").trim().toLowerCase() === buscado
    );
    return encontrado ? encontrado[campoId] : undefined;
};

// El formulario tiene el NOMBRE del tipo y del estado, pero en la base se guardan sus ID.
// Esta función busca esos ID (o los crea si todavía no existen), igual que Agregar equipo.
// Devuelve { ok: true, id_tipoeq, id_estadoeq } o { ok: false, mensaje }.
async function obtenerIdsTipoEstado(tipo, estado) {
    const tipos = await cargarTiposIniciales();
    if (!tipos.ok) return tipos;
    let id_tipoeq = buscarIdPorNombre(tipos.datos, "id_tipoeq", "nombre_tipoeq", tipo);
    if (!id_tipoeq) {
        const nuevoTipo = await crearTipoEquipo({ nombre_tipoeq: tipo });
        if (!nuevoTipo.ok) return nuevoTipo;
        id_tipoeq = nuevoTipo.dato.id_tipoeq;
    }

    const estados = await obtenerEstadosEquipo();
    if (!estados.ok) return estados;
    let id_estadoeq = buscarIdPorNombre(estados.datos, "id_estadoeq", "nombre_estadoeq", estado);
    if (!id_estadoeq) {
        const nuevoEstado = await crearEstadoEquipo({ nombre_estadoeq: estado });
        if (!nuevoEstado.ok) return nuevoEstado;
        id_estadoeq = nuevoEstado.dato.id_estadoeq;
    }

    return { ok: true, id_tipoeq, id_estadoeq };
}

// ---------------------------------------------------------------
// PANTALLA: formulario para modificar un equipo
// "navigation" sirve para volver atrás y "route" trae el ID del equipo
// (lo manda el listado al tocar el lápiz, o el detalle con "Editar equipo")
// ---------------------------------------------------------------
export default function ModificarEquipo({ navigation, route }) {
    const { idEquipo } = route.params;

    // Guarda si todavía se están trayendo los datos y si hubo un error
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");
    // true mientras se guarda, para no guardar dos veces si tocan el botón de nuevo
    const [guardando, setGuardando] = useState(false);
    // función para mostrar el aviso de éxito o de error
    const { mostrarNotificacion } = useNotificacion();

    // Mismo formulario que el registro (mismo esquema de validación)
    const {
        control,                  // conecta cada campo con el formulario
        handleSubmit,             // valida y recién ahí ejecuta onSubmit
        getValues,                // lee el valor actual de un campo
        reset,                    // carga los datos del equipo en los campos
        formState: { errors },    // errores de cada campo (si los hay)
    } = useForm({
        resolver: zodResolver(equipoFormSchema),
        defaultValues: { nombre: "", tipo: "", cantidad: "", estado: "", descripcion: "" },
    });

    // Vuelve a la pantalla anterior (solo si hay una a la que volver)
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    // Al abrir la pantalla: trae el equipo (con los nombres de tipo y estado)
    // y rellena el formulario con sus datos.
    useEffect(() => {
        let activo = true; // evita actualizar la pantalla si ya se cerró

        const cargarEquipo = async () => {
            const resultado = await obtenerDetalleEquipo(idEquipo);
            if (!activo) return;

            // Si algo falló, se muestra su mensaje de error
            if (!resultado.ok) {
                setErrorCarga(resultado.mensaje);
                setCargando(false);
                return;
            }

            const equipo = resultado.dato;
            reset({
                nombre: equipo.nombre,
                tipo: equipo.tipo,
                cantidad: String(equipo.cantidad ?? ""),
                estado: equipo.estado,
                descripcion: equipo.descripcion,
            });
            setCargando(false);
        };

        cargarEquipo();
        return () => {
            activo = false;
        };
    }, [idEquipo, reset]);

    // Devuelve el mensaje de error de un campo, o undefined si no tiene error.
    // Si el campo está vacío muestra "Este campo es obligatorio";
    // si tiene algo mal (ej. cantidad negativa) muestra el mensaje del esquema.
    const mensajeError = (campo) => {
        const error = errors[campo];
        if (!error) return undefined;
        const vacio = String(getValues(campo) ?? "").trim() === "";
        return vacio ? "Este campo es obligatorio" : error.message;
    };

    // Se ejecuta al tocar "Guardar cambios", pero SOLO si todos los campos son válidos.
    // S5-09: guarda los cambios en Firestore con modificarEquipo y muestra
    // "Equipo modificado correctamente." (flujo 18) o el mensaje de error.
    const onSubmit = async (datos) => {
        if (guardando) return;
        setGuardando(true);
        try {
            // 1) Pasar los nombres de tipo y estado a sus ID
            const ids = await obtenerIdsTipoEstado(datos.tipo, datos.estado);
            if (!ids.ok) return mostrarNotificacion(ids.mensaje, "error");

            // 2) Guardar (modificarEquipo también revisa que no haya otro equipo igual)
            const resultado = await modificarEquipo(idEquipo, {
                id_tipoeq: ids.id_tipoeq,
                id_estadoeq: ids.id_estadoeq,
                nombre_equipo: datos.nombre.trim(),
                cantidad_equipo: Number(datos.cantidad),
                descripcion_equipo: datos.descripcion ?? "",
            });

            // 3) Avisar cómo salió
            if (resultado.ok) {
                mostrarNotificacion(resultado.mensaje, "exito");
                volver(); // vuelve al detalle o al listado, que se recargan solos
            } else {
                mostrarNotificacion(resultado.mensaje, "error");
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        // Evita que el teclado tape los campos en iOS
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* Scroll por si la pantalla es chica; mantiene los toques con el teclado abierto */}
            <ScrollView
                contentContainerStyle={styles.contenidoConFoto}
                keyboardShouldPersistTaps="handled"
            >
                {/* Foto fija de arriba (la misma del registro) */}
                <FotoCabecera />

                {/* Todo el formulario va dentro de esta caja con márgenes */}
                <View style={styles.formulario}>
                <Text style={styles.titulo}>Editar equipo</Text>

                {cargando ? (
                    // Mientras se traen los datos
                    <ActivityIndicator size="large" color={COLORS.azul} />
                ) : errorCarga ? (
                    // Si no se pudo traer el equipo
                    <MensajeError mensaje={errorCarga} tipo="banner" />
                ) : (
                    <>
                        <FormularioEquipo control={control} mensajeError={mensajeError} />

                        {/* Botón principal: valida el formulario y ejecuta onSubmit */}
                        <TouchableOpacity
                            style={[styles.boton, guardando && { opacity: 0.6 }]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={guardando}
                        >
                            <Text style={styles.botonTexto}>
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Cancelar: vuelve atrás sin guardar */}
                <TouchableOpacity onPress={volver}>
                    <Text style={styles.cancelar}>Cancelar</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Flecha para volver: va DESPUÉS del scroll para quedar encima de la foto */}
            <FlechaVolver onPress={volver} />
        </KeyboardAvoidingView>
    );
}
