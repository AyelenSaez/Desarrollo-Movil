// Pantalla de registro de usuario: formulario con nombre, apellido, correo,
// contraseña (con checklist de requisitos), confirmación y términos y condiciones.

// React y useState: guardar valores de la pantalla (cargando, errores, ver contraseña).
import React, { useState } from "react";
// Componentes de React Native:
import {
  View,                 // contenedor
  Text,                 // texto
  TextInput,            // campo de texto
  TouchableOpacity,     // botón que se puede tocar
  ScrollView,           // pantalla con scroll
  StyleSheet,           // crear estilos
  Image,                // logo
  KeyboardAvoidingView, // evita que el teclado tape los campos
  Platform,             // saber si es iOS o Android
  ActivityIndicator,    // ruedita de carga dentro del botón
} from "react-native";
// Ionicons: íconos (sobre, candado, ojo, checkbox, checks de requisitos).
import { Ionicons } from "@expo/vector-icons";
// useForm: maneja el formulario y sus errores. Controller: conecta cada campo con el formulario.
import { useForm, Controller } from "react-hook-form";
// zodResolver: hace que react-hook-form valide con el esquema de zod.
import { zodResolver } from "@hookform/resolvers/zod";
// z (zod): para definir las reglas de validación.
import { z } from "zod";
// createUserWithEmailAndPassword: crea la cuenta en Firebase con correo y contraseña.
import { createUserWithEmailAndPassword } from "firebase/auth";
// auth: instancia de Firebase Auth.
import { auth } from "../src/config/firebaseConfig";
// crearPerfil: guarda el documento del usuario en la colección "usuarios"
import { crearPerfil } from "../src/services/perfilService";
// FUENTES: fuente Work Sans de toda la app (reemplaza a fontWeight)
import { FUENTES } from '../src/theme/fuentes';
import MensajeError from "../components/MensajeError"; // el mismo que usa Login

// Colores tomados de Login.js para que las dos pantallas se vean igual
const COLORS = {
  azul: "#0b2f5b",
  verde: "#4e7246",
  borde: "#C9CED6",
  placeholder: "#9AA1AB",
  icono: "#6B7280",
  error: "#e05252",
  asterisco: "#d32f2f",
  ok: "#2E7D32",
  fondoReglas: "#F3F4F6",
  blanco: "#FFFFFF",
};

// ---------------------------------------------------------------
// Requisitos de la contraseña (los mismos que muestra el Figma)
// ---------------------------------------------------------------
const REGLAS_PASSWORD = [
  { id: "largo", texto: "Mínimo 8 caracteres", cumple: (v) => v.length >= 8 },
  { id: "mayus", texto: "Una letra mayúscula", cumple: (v) => /[A-Z]/.test(v) },
  { id: "numero", texto: "Un número", cumple: (v) => /[0-9]/.test(v) },
  {
    id: "especial",
    texto: "Un carácter especial (!@#$)",
    cumple: (v) => /[^A-Za-z0-9\s]/.test(v),
  },
];

// ---------------------------------------------------------------
// Validaciones con zod (mensajes alineados con los del Login)
// ---------------------------------------------------------------
const OBLIGATORIO = "Este campo es obligatorio";

// Esquema del formulario. .refine agrega reglas personalizadas:
// - la contraseña debe cumplir todas las REGLAS_PASSWORD
// - los términos deben estar aceptados
// - la confirmación debe ser igual a la contraseña (el error se muestra en confirmPassword)
const schema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, OBLIGATORIO)
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z
      .string()
      .trim()
      .min(1, OBLIGATORIO)
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, OBLIGATORIO)
      .email("El formato del correo electrónico no es válido"),
    password: z
      .string()
      .min(1, OBLIGATORIO)
      .refine(
        (v) => REGLAS_PASSWORD.every((regla) => regla.cumple(v)),
        "La contraseña no cumple con los requisitos"
      ),
    confirmPassword: z.string().min(1, OBLIGATORIO),
    terminos: z.boolean().refine((v) => v === true, {
      message: "Debe aceptar los términos y condiciones",
    }),
  })
  .refine((datos) => datos.password === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------
// Campo de texto reutilizable (label + ícono + input + error)
// ---------------------------------------------------------------
// Props: label (título), icono (nombre de Ionicons), error (mensaje),
// esPassword (agrega el botón del ojo) y el resto se pasa directo al TextInput.
function Campo({ label, icono, error, esPassword, ...inputProps }) {
  // true = texto oculto con puntitos (solo arranca oculto si es contraseña)
  const [oculto, setOculto] = useState(!!esPassword);

  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>
        {label} <Text style={styles.asterisco}>*</Text>
      </Text>

      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        {icono ? (
          <Ionicons
            name={icono}
            size={20}
            color={error ? COLORS.error : COLORS.icono}
            style={styles.iconoIzq}
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={oculto}
          autoCapitalize="none"
          {...inputProps}
        />

        {esPassword ? (
          <TouchableOpacity
            onPress={() => setOculto(!oculto)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={oculto ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={error ? COLORS.error : COLORS.icono}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Mismo componente de error que usa Login */}
      {error ? (
        <View style={styles.errorWrap}>
          <MensajeError mensaje={error} />
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------
// Checklist "Tu contraseña debe tener:"
// gris = todavía no escribió nada, verde = cumple, rojo = no cumple
// ---------------------------------------------------------------
function ReglasPassword({ password }) {
  // true si el usuario ya escribió algo en la contraseña
  const empezo = password.length > 0;

  return (
    <View style={styles.reglasBox}>
      <Text style={styles.reglasTitulo}>Tu contraseña debe tener:</Text>
      {REGLAS_PASSWORD.map((regla) => {
        const ok = regla.cumple(password);
        let icono = "ellipse-outline";
        let color = COLORS.placeholder;
        if (empezo && ok) {
          icono = "checkmark-circle";
          color = COLORS.ok;
        } else if (empezo && !ok) {
          icono = "close-circle";
          color = COLORS.error;
        }
        return (
          <View key={regla.id} style={styles.reglaFila}>
            <Ionicons name={icono} size={14} color={color} />
            <Text style={[styles.reglaTexto, { color }]}>{regla.texto}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------
// Pantalla
// ---------------------------------------------------------------
// "navigation" sirve para volver al Login.
// "setMostrarRegistroExito" viene de Navigation.js y activa la pantalla "Cuenta creada".
export default function SignUp({ navigation, setMostrarRegistroExito }) {
  const [cargando, setCargando] = useState(false);       // true mientras se crea la cuenta
  const [errorGeneral, setErrorGeneral] = useState("");  // mensaje del banner de error

  // Configuración del formulario (react-hook-form)
  const {
    control,                // conecta cada Controller con el formulario
    handleSubmit,           // valida y, si está todo bien, ejecuta onSubmit
    watch,                  // lee en vivo el valor de un campo
    trigger,                // fuerza la validación de un campo
    getValues,              // lee el valor actual de un campo
    formState: { errors },  // errores de cada campo
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched", // valida un campo recién cuando el usuario sale de él
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmPassword: "",
      terminos: false,
    },
  });

  // Contraseña actual, para actualizar el checklist mientras se escribe
  const password = watch("password");

  // Solo se ejecuta si la validación de zod pasó correctamente
  const onSubmit = async ({ nombre, apellido, email, password }) => {
    console.log("=== onSubmit ejecutado ===", email);
    setErrorGeneral("");
    setCargando(true);
    // Igual que en el Login: se avisa antes a Navigation para que, cuando
    // Firebase inicie sesión al crear la cuenta, muestre "Cuenta creada"
    // y no salte directo a Home.
    setMostrarRegistroExito?.(true);
    try {
            // credencial: contiene el usuario recién creado (y su UID)
      const credencial = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Guardar el perfil en Firestore (colección "usuarios", id = UID)
      const perfil = await crearPerfil(credencial.user.uid, { nombre, apellido, email });
      // Log temporal: muestra en la terminal si se guardó el perfil (borrar al terminar las pruebas)
      console.log("Resultado crearPerfil:", perfil);
      if (!perfil.ok) {
        console.warn("No se pudo guardar el perfil:", perfil.codigo, perfil.mensaje);
      }
      // Navigation detecta la sesión y muestra la pantalla "Cuenta creada".
    } catch (error) {
      setMostrarRegistroExito?.(false); // falló: no mostrar la pantalla de éxito
      console.log("Error de registro:", error.code, error.message);
      // Según el código de error de Firebase se elige el mensaje del banner
      switch (error.code) {
        case "auth/email-already-in-use":
          setErrorGeneral("El correo electrónico ya está registrado.");
          break;
        case "auth/invalid-email":
          setErrorGeneral("El formato del correo electrónico no es válido");
          break;
        case "auth/weak-password":
          setErrorGeneral("La contraseña es demasiado débil.");
          break;
        case "auth/network-request-failed":
          setErrorGeneral("Error de conexión, por favor intenta más tarde.");
          break;
        case "auth/invalid-api-key":
          setErrorGeneral(
            "La clave API de Firebase no es válida. Revisa el archivo .env."
          );
          break;
        default:
          setErrorGeneral(
            "Hubo un problema al crear la cuenta. Intente nuevamente."
          );
      }
      setCargando(false);
    }
  };

  return (
    // Evita que el teclado tape los campos en iOS
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Scroll: el formulario es largo y no entra entero en pantalla */}
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo y línea azul debajo */}
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.separador} />

        {/* Banner de error general (igual que el del Login) */}
        {errorGeneral ? (
          <MensajeError tipo="banner" mensaje={errorGeneral} />
        ) : null}

        <Text style={styles.titulo}>Crear cuenta</Text>

        {/* Nombre */}
        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <Campo
              label="Nombre"
              placeholder="Ej: Juan"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.nombre?.message}
            />
          )}
        />

        {/* Apellido */}
        <Controller
          control={control}
          name="apellido"
          render={({ field: { onChange, onBlur, value } }) => (
            <Campo
              label="Apellido"
              placeholder="Ej: Pérez"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.apellido?.message}
            />
          )}
        />

        {/* Correo */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Campo
              label="Correo electrónico"
              icono="mail-outline"
              placeholder="ejemplo@correo.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />

        {/* Contraseña */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Campo
              label="Contraseña"
              icono="lock-closed-outline"
              placeholder="Ej: Prueba123!"
              value={value}
              onChangeText={(texto) => {
                onChange(texto);
                // si ya escribió la confirmación, la revalida
                if (getValues("confirmPassword")) trigger("confirmPassword");
              }}
              onBlur={onBlur}
              esPassword
              error={errors.password?.message}
            />
          )}
        />
        <ReglasPassword password={password} />

        {/* Confirmar contraseña */}
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Campo
              label="Confirmar contraseña"
              icono="lock-closed-outline"
              placeholder="Repita su contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              esPassword
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {/* Términos y condiciones */}
        <Controller
          control={control}
          name="terminos"
          render={({ field: { onChange, value } }) => (
            <View style={styles.grupo}>
              <View style={styles.terminosFila}>
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={value ? "checkbox" : "square-outline"}
                    size={20}
                    color={value ? COLORS.verde : COLORS.icono}
                  />
                </TouchableOpacity>
                <Text style={styles.terminosTexto}>
                  Acepto los{" "}
                  <Text
                    style={styles.link}
                    onPress={() => {
                      // TODO: abrir pantalla o modal de Términos y Condiciones
                    }}
                  >
                    Términos y Condiciones
                  </Text>
                </Text>
              </View>
              {errors.terminos?.message ? (
                <View style={styles.errorWrap}>
                  <MensajeError mensaje={errors.terminos.message} />
                </View>
              ) : null}
            </View>
          )}
        />

        {/* Botón: valida el formulario y ejecuta onSubmit (muestra una ruedita mientras carga) */}
        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleSubmit(onSubmit)}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={COLORS.blanco} />
          ) : (
            <Text style={styles.botonTexto}>Registrarse</Text>
          )}
        </TouchableOpacity>

        {/* Leyenda de campos obligatorios (S14-11) */}
        <Text style={styles.leyenda}>
          Todos los campos (<Text style={styles.asterisco}>*</Text>) son
          obligatorios
        </Text>

        {/* Link al login */}
        <View style={styles.pie}>
          <Text style={styles.pieTexto}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.pieLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos de la pantalla de registro
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.blanco },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 24, // más chico que antes: ahora la pantalla tiene header
    paddingBottom: 32,
  },
  logo: { width: "100%", height: 80 },
  separador: {
    height: 1,
    backgroundColor: COLORS.azul,
    marginTop: 12,
    marginBottom: 20,
    width: "60%",
    alignSelf: "center",
  },
  titulo: {
    fontFamily: FUENTES.bold,
    fontSize: 22,
    color: COLORS.azul,
    marginBottom: 12,
  },
  grupo: { marginBottom: 14 },
  label: { fontFamily: FUENTES.regular, fontSize: 14, color: COLORS.azul, marginBottom: 6 },
  asterisco: { color: COLORS.asterisco },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borde,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapError: { borderColor: COLORS.error },
  iconoIzq: { marginRight: 8 },
  input: { fontFamily: FUENTES.regular, flex: 1, fontSize: 15, color: "#111827" },
  reglasBox: {
    backgroundColor: COLORS.fondoReglas,
    borderRadius: 8,
    padding: 10,
    marginTop: -4,
    marginBottom: 14,
  },
  reglasTitulo: { fontFamily: FUENTES.regular, fontSize: 11, color: COLORS.icono, marginBottom: 4 },
  reglaFila: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  reglaTexto: { fontFamily: FUENTES.regular, fontSize: 11, marginLeft: 6 },
  terminosFila: { flexDirection: "row", alignItems: "center" },
  terminosTexto: { fontFamily: FUENTES.regular, fontSize: 12, color: COLORS.azul, marginLeft: 8 },
  link: { textDecorationLine: "underline", color: COLORS.azul },
  boton: {
    backgroundColor: COLORS.verde,
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  botonDeshabilitado: { opacity: 0.7 },
  botonTexto: { fontFamily: FUENTES.bold, color: COLORS.blanco, fontSize: 16 },
  leyenda: {
    fontFamily: FUENTES.regular,
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    marginTop: 12,
  },
  pie: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  pieTexto: { fontFamily: FUENTES.regular, fontSize: 13, color: "#111827" },
  pieLink: { fontFamily: FUENTES.bold, fontSize: 13, color: "#111827" },
  errorWrap: { marginTop: 20 },
});