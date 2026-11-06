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

// Trae el equipo por ID con los nombres de su tipo y estado
import { obtenerDetalleEquipo } from "../src/services/equipoService";

// Mismos campos, colores, foto, flecha y estilos que la pantalla de registro
import { COLORS, FormularioEquipo, FotoCabecera, FlechaVolver, styles } from "./RegistroEquipo";

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
    // Por ahora solo muestra los datos en la consola.
    // El guardado en Firestore (S5-09) lo conecta quien tenga esa tarea acá adentro.
    const onSubmit = (datos) => {
        console.log("Datos a modificar:", { idEquipo, ...datos });
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
                        <TouchableOpacity style={styles.boton} onPress={handleSubmit(onSubmit)}>
                            <Text style={styles.botonTexto}>Guardar cambios</Text>
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
