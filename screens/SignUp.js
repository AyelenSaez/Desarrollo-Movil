import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


// ---------------------------------------------------------------
// Colores: son aproximados. Ajustalos con los valores reales del
// Figma (modo Dev / Inspect).
// ---------------------------------------------------------------
const COLORS = {
  azul: "#0B3A6B",
  verde: "#4B6B3A",
  borde: "#C9CED6",
  placeholder: "#9AA1AB",
  icono: "#6B7280",
  error: "#D32F2F",
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
// Validaciones con zod
// ---------------------------------------------------------------
const schema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "Ingresá tu nombre")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "Ingresá tu correo electrónico")
      .email("Ingresá un correo electrónico válido"),
    password: z
      .string()
      .min(1, "Ingresá una contraseña")
      .refine(
        (v) => REGLAS_PASSWORD.every((regla) => regla.cumple(v)),
        "La contraseña no cumple con los requisitos"
      ),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
    terminos: z.boolean().refine((v) => v === true, {
      message: "Tenés que aceptar los términos y condiciones",
    }),
  })
  .refine((datos) => datos.password === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------
// Campo de texto reutilizable (label + ícono + input + error)
// ---------------------------------------------------------------
function Campo({ label, icono, error, esPassword, ...inputProps }) {
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
            color={COLORS.icono}
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
              color={COLORS.icono}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.textoError}>{error}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------
// Checklist "Tu contraseña debe tener:"
// gris = todavía no escribió nada, verde = cumple, rojo = no cumple
// ---------------------------------------------------------------
function ReglasPassword({ password }) {
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
export default function SignUp({ navigation }) {
  const [cargando, setCargando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      terminos: false,
    },
  });

  const password = watch("password");

  const onSubmit = async (datos) => {
    setErrorGeneral("");
    setCargando(true);
    try {
      // TODO: acá va la creación de la cuenta con Firebase Auth
      // (tarea "Registro: creación de cuenta con Firebase"), por ejemplo:
      // await createUserWithEmailAndPassword(auth, datos.email, datos.password);
      // Por ahora simulamos la espera para ver el estado de carga.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("¡Listo!", "Tu cuenta fue creada correctamente.");
      // navigation.navigate("Login");
    } catch (e) {
      setErrorGeneral("No pudimos crear tu cuenta. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cambiá la ruta si el logo tiene otro nombre en /assets */}
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.separador} />

        <Text style={styles.titulo}>Crear cuenta</Text>

        {/* Nombre */}
        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, onBlur, value } }) => (
            <Campo
              label="Nombre"
              placeholder="Nombre"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.nombre?.message}
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
              placeholder="Correo electrónico"
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
              placeholder="Contraseña"
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
              placeholder="Confirmar contraseña"
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
                <Text style={styles.textoError}>{errors.terminos.message}</Text>
              ) : null}
            </View>
          )}
        />

        {errorGeneral ? (
          <Text style={[styles.textoError, styles.errorGeneral]}>
            {errorGeneral}
          </Text>
        ) : null}

        {/* Botón */}
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

        {/* Link al login */}
        <View style={styles.pie}>
          <Text style={styles.pieTexto}>¿Ya tienes una cuenta? </Text>
          {/* Cambiá "Login" por el nombre con que está registrada la ruta */}
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.pieLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.blanco },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 56,
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
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.azul,
    marginBottom: 12,
  },
  grupo: { marginBottom: 14 },
  label: { fontSize: 14, color: COLORS.azul, marginBottom: 6 },
  asterisco: { color: COLORS.error },
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
  input: { flex: 1, fontSize: 15, color: "#111827" },
  textoError: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  errorGeneral: { textAlign: "center", marginBottom: 8 },
  reglasBox: {
    backgroundColor: COLORS.fondoReglas,
    borderRadius: 8,
    padding: 10,
    marginTop: -4,
    marginBottom: 14,
  },
  reglasTitulo: { fontSize: 11, color: COLORS.icono, marginBottom: 4 },
  reglaFila: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  reglaTexto: { fontSize: 11, marginLeft: 6 },
  terminosFila: { flexDirection: "row", alignItems: "center" },
  terminosTexto: { fontSize: 12, color: COLORS.azul, marginLeft: 8 },
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
  botonTexto: { color: COLORS.blanco, fontSize: 16, fontWeight: "700" },
  pie: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  pieTexto: { fontSize: 13, color: "#111827" },
  pieLink: { fontSize: 13, fontWeight: "700", color: "#111827" },
});