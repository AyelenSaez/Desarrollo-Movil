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
    Image,                 // para mostrar la foto de arriba
    ActivityIndicator,     // circulito de carga
} from "react-native";

// Íconos, los mismos que usan las demás pantallas
import { Ionicons } from "@expo/vector-icons";

// Mismo componente de error que usan las demás pantallas
import MensajeError from "../components/MensajeError";

// react-hook-form + zod: mismo formulario y esquema que el registro
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { equipoFormSchema } from "../src/validations/equipoFormSchema";

// Lista fija de tipos (Sonido, Iluminación, Infraestructura)
import { LISTA_TIPOS_EQUIPO } from "../src/utils/tiposEquipos";

// Funciones del servicio: traen el equipo por ID y los nombres de tipos y estados
import {
    obtenerEquipoPorId,
    obtenerTiposEquipo,
    obtenerEstadosEquipo,
} from "../src/services/equipoService";

// Mismos campos, colores y estilos que la pantalla de registro
import { COLORS, ESTADOS, Campo, Selector, styles } from "./RegistroEquipo";

// ---------------------------------------------------------------
// PANTALLA: formulario para modificar un equipo
// "navigation" sirve para volver atrás y "route" trae el ID del equipo
// (lo manda el listado al tocar el lápiz de una tarjeta)
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
        defaultValues: { nombre: "", tipo: "", cantidad: "", estado: "" },
    });

    // Vuelve a la pantalla anterior (solo si hay una a la que volver)
    const volver = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    // Al abrir la pantalla: trae el equipo y los nombres de tipos y estados.
    // El equipo guarda solo el ID de su tipo y de su estado,
    // por eso se buscan sus nombres para mostrarlos en los desplegables.
    useEffect(() => {
        let activo = true; // evita actualizar la pantalla si ya se cerró

        const cargarEquipo = async () => {
            const [equipo, tipos, estados] = await Promise.all([
                obtenerEquipoPorId(idEquipo),
                obtenerTiposEquipo(),
                obtenerEstadosEquipo(),
            ]);
            if (!activo) return;

            // Si algo falló, se muestra su mensaje de error
            const fallo = [equipo, tipos, estados].find((r) => !r.ok);
            if (fallo) {
                setErrorCarga(fallo.mensaje);
                setCargando(false);
                return;
            }

            const tipo = tipos.datos.find((t) => t.id_tipoeq === equipo.dato.id_tipoeq);
            const estado = estados.datos.find((e) => e.id_estadoeq === equipo.dato.id_estadoeq);

            // Rellena el formulario con los datos del equipo
            reset({
                nombre: equipo.dato.nombre_equipo,
                tipo: tipo?.nombre_tipoeq ?? "",
                cantidad: String(equipo.dato.cantidad_equipo),
                estado: estado?.nombre_estadoeq ?? "",
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
                contentContainerStyle={styles.contenido}
                keyboardShouldPersistTaps="handled"
            >
                {/* Foto fija de arriba (la misma del registro) */}
                <Image
                    source={require("../assets/equipo.jpeg")}
                    style={styles.imagen}
                />

                {/* Todo el formulario va dentro de esta caja con márgenes */}
                <View style={styles.formulario}>
                    <Text style={styles.titulo}>Modificar equipo</Text>

                    {cargando ? (
                        // Mientras se traen los datos
                        <ActivityIndicator size="large" color={COLORS.azul} />
                    ) : errorCarga ? (
                        // Si no se pudo traer el equipo
                        <MensajeError mensaje={errorCarga} tipo="banner" />
                    ) : (
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
                                        error={mensajeError("nombre")}
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