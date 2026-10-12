import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth } from '../src/config/firebaseConfig';
import { colors } from '../src/theme/colors';
import MensajeError from '../components/MensajeError';
import CampoTexto from '../components/CampoTexto';
import CampoContrasena from '../components/CampoContrasena';
import RequisitosContrasena, { evaluarRequisitos } from '../components/RequisitosContrasena';
import CasillaVerificacion from '../components/CasillaVerificacion';
import BotonPrincipal from '../components/BotonPrincipal';

const OBLIGATORIO = 'Este campo es obligatorio';

// ESQUEMA DE VALIDACIÓN (zod)
// Define cómo debe ser un formulario válido. Las reglas se evalúan en orden: si el campo
// está vacío se muestra el primer mensaje y no el del formato.
const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, OBLIGATORIO),
    lastName: z.string().trim().min(1, OBLIGATORIO),
    email: z
      .string()
      .trim()                     // quita los espacios de los bordes
      .min(1, OBLIGATORIO)
      .email('Ingresa un correo válido (ej: nombre@correo.com)'),
    password: z
      .string()
      .min(1, OBLIGATORIO)
      // usa los mismos requisitos que muestra la caja "Tu contraseña debe tener:"
      .refine(
        (valor) => evaluarRequisitos(valor).every((r) => r.cumple),
        'La contraseña no cumple todos los requisitos',
      ),
    confirmPassword: z.string().min(1, OBLIGATORIO),
    terms: z.boolean().refine((valor) => valor, 'Debes aceptar los Términos y Condiciones'),
  })
  // Compara las dos contraseñas y muestra el error debajo de "Confirmar contraseña".
  // when: () => true hace que se revise aunque otros campos tengan errores.
  .refine((datos) => datos.password === datos.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
    when: () => true,
  });

export default function SignUp({ navigation }) {
  // ESTADOS LOCALES
  const [passwordFocused, setPasswordFocused] = useState(false); // true = se muestra la caja de requisitos
  const [loading, setLoading] = useState(false);                 // true = el botón muestra el spinner
  const [signUpError, setSignUpError] = useState(null);          // error general de Firebase (banner)

  // Para pasar al siguiente campo con la tecla "siguiente" del teclado
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  // CONFIGURACIÓN DEL FORMULARIO (react-hook-form)
  const {
    control,                 // lo usa cada Controller para engancharse al formulario
    handleSubmit,            // valida y, si todo está bien, ejecuta la función de envío
    clearErrors,             // borra errores manualmente
    setError,                // marca un error a mano (por ejemplo, correo ya registrado)
    watch,                   // lee un valor del formulario en tiempo real
    formState: { errors },   // objeto con los errores actuales (errors.email, errors.password...)
  } = useForm({
    resolver: zodResolver(signUpSchema),   // valida con el esquema de zod
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false,
    },
  });

  const password = watch('password'); // la caja de requisitos se actualiza mientras se escribe

  // Al tocar un campo se borra su error y el banner de Firebase
  const limpiarError = (campo) => {
    clearErrors(campo);
    setSignUpError(null);
  };

  // ENVÍO DEL FORMULARIO: solo se ejecuta si la validación de zod pasó correctamente
  const onSubmit = async ({ firstName, lastName, email, password }) => {
    setSignUpError(null); // limpia el error del intento anterior
    setLoading(true);

    let credential;
    try {
      // Crea la cuenta en Firebase
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      console.log('Error de registro:', error.code, error.message);
      switch (error.code) {
        case 'auth/email-already-in-use':
          // Este error se muestra debajo del campo correo
          setError('email', { message: 'El correo electrónico ya está en uso.' });
          break;
        case 'auth/invalid-email':
          setError('email', { message: 'El formato del correo electrónico no es válido.' });
          break;
        case 'auth/weak-password':
          setError('password', { message: 'La contraseña es demasiado débil.' });
          break;
        case 'auth/network-request-failed':
          setSignUpError('Error de conexión, por favor intenta más tarde.');
          break;
        case 'auth/invalid-api-key':
          setSignUpError('La clave API de Firebase no es válida. Revisa el archivo .env.');
          break;
        default:
          setSignUpError('Hubo un problema al registrar el usuario.');
      }
      return;
    }

    // Guarda "Nombre Apellido" en el perfil del usuario
    try {
      await updateProfile(credential.user, { displayName: `${firstName} ${lastName}` });
      Alert.alert('Registro exitoso', 'Usuario registrado con éxito.');
    } catch (error) {
      Alert.alert('Cuenta creada', 'La cuenta se creó, pero no se pudo guardar el nombre.');
    }
    // Firebase inicia la sesión y Navigation muestra Home.
  };

  // INTERFAZ
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // compensa el encabezado "Registro"
    >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* ---------- LOGO ---------- */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        accessibilityLabel="Infinito Sonido e Iluminación"
      />
      <View style={styles.divider} />

      <Text style={styles.title} accessibilityRole="header">Crear cuenta</Text>

      {/* Banner de error de Firebase (solo aparece si falló el registro) */}
      {signUpError && <MensajeError tipo="banner" mensaje={signUpError} />}

      {/* ---------- NOMBRE Y APELLIDO (en la misma fila) ---------- */}
      <View style={styles.row}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              style={styles.half}
              etiqueta="Nombre"
              obligatorio
              placeholder="Nombre"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onFocus={() => limpiarError('firstName')}
              error={errors.firstName?.message}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <CampoTexto
              style={styles.half}
              inputRef={lastNameRef}
              etiqueta="Apellido"
              obligatorio
              placeholder="Apellido"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onFocus={() => limpiarError('lastName')}
              error={errors.lastName?.message}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
        />
      </View>

      {/* ---------- CORREO ---------- */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <CampoTexto
            inputRef={emailRef}
            etiqueta="Correo electrónico"
            obligatorio
            icono="envelope-o"
            placeholder="ejemplo@correo.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            onFocus={() => limpiarError('email')}
            error={errors.email?.message}
            keyboardType="email-address"   // teclado con arroba
            autoCapitalize="none"          // sin mayúscula inicial
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />

      {/* ---------- CONTRASEÑA + CAJA DE REQUISITOS ---------- */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <CampoContrasena
            inputRef={passwordRef}
            etiqueta="Contraseña"
            obligatorio
            placeholder="Contraseña"
            value={value}
            onChangeText={onChange}
            onFocus={() => { limpiarError('password'); setPasswordFocused(true); }}
            onBlur={() => { onBlur(); setPasswordFocused(false); }}
            error={errors.password?.message}
            autoComplete="new-password"     // permite que el celular sugiera una contraseña segura
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmRef.current?.focus()}
          />
        )}
      />
      {/* La caja aparece solo mientras se escribe la contraseña */}
      {passwordFocused && <RequisitosContrasena contrasena={password} />}

      {/* ---------- CONFIRMAR CONTRASEÑA ---------- */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <CampoContrasena
            inputRef={confirmRef}
            etiqueta="Confirmar contraseña"
            obligatorio
            placeholder="Confirmar contraseña"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            onFocus={() => limpiarError('confirmPassword')}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />

      {/* ---------- TÉRMINOS Y CONDICIONES ---------- */}
      <Controller
        control={control}
        name="terms"
        render={({ field: { onChange, value } }) => (
          <CasillaVerificacion
            marcado={value}
            onCambiar={(nuevoValor) => { onChange(nuevoValor); limpiarError('terms'); }}
            error={errors.terms?.message}
          >
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text
                style={styles.termsLink}
                accessibilityRole="link"
                // por ahora solo muestra una alerta
                onPress={() => Alert.alert('Términos y Condiciones', 'Próximamente.')}
              >
                Términos y Condiciones
              </Text>
            </Text>
          </CasillaVerificacion>
        )}
      />

      {/* ---------- BOTÓN REGISTRARSE ---------- */}
      <BotonPrincipal titulo="Registrarse" onPress={handleSubmit(onSubmit)} cargando={loading} />

      {/* ---------- ENLACE A INICIAR SESIÓN ---------- */}
      <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>
          ¿Ya tienes una cuenta? <Text style={styles.bold}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: colors.white,
  },
  logo: {
    width: '90%',
    height: undefined,
    aspectRatio: 2170 / 725, // proporción real de assets/logo.png
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  divider: {
    width: 218,
    height: 2,
    backgroundColor: colors.title,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.title,
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  termsText: {
    fontSize: 12,
    letterSpacing: 0.36,
    color: colors.text,
  },
  termsLink: {
    color: colors.title,
    textDecorationLine: 'underline',
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 18,
    color: colors.text,
  },
  bold: {
    fontWeight: 'bold',
  },
});
