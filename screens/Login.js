import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as SecureStore from 'expo-secure-store'; // guarda datos de forma cifrada en el celular
import { auth } from '../src/config/firebaseConfig';
import MensajeError from '../components/MensajeError'; 
// ESQUEMA DE VALIDACIÓN (zod)
// Define cómo debe ser un formulario válido. Las reglas se  evalúan en orden: si el campo está vacío se muestra el primer mensaje y no el del formato.

const loginSchema = z.object({
  email: z
    .string()                                          
    .trim()                     //se asegura de quitar los espacios de los bordes                       
    .min(1, 'Este campo es obligatorio')               
    .email('El formato del correo electrónico no es válido'), 
  password: z
    .string()                                         
    .min(1, 'Este campo es obligatorio'),             
});

// Nombres con los que se guardan los datos de "Recordarme" en el celular
const CLAVE_EMAIL = 'recordar_email';
const CLAVE_PASSWORD = 'recordar_password';

export default function Login({ navigation, setMostrarExito }) { 
  // ESTADOS LOCALES
  const [showPassword, setShowPassword] = useState(false); // true = contraseña visible
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState(null);         // estado del checkbox "Recordarme"

  // CONFIGURACIÓN DEL FORMULARIO (react-hook-form)
  const {
    control,                 // lo usa cada Controller para engancharse al formulario
    handleSubmit,            // valida y, si todo está bien, ejecuta la función de envío
    clearErrors,             // borra errores manualmente
    watch,                   // lee los valores actuales de los campos
    reset,                   // cambia los valores del formulario (se usa para rellenar los campos)
    formState: { errors },   // objeto con los errores actuales (errors.email, errors.password)
  } = useForm({
    resolver: zodResolver(loginSchema),            // valida con el esquema de zod
    defaultValues: { email: '', password: '' },    // ambos campos arrancan vacíos
  });


  // AL ABRIR LA PANTALLA: si la última vez se tildó "Recordarme", rellena los campos
  useEffect(() => {
    const cargarDatosGuardados = async () => {
      try {
        const emailGuardado = await SecureStore.getItemAsync(CLAVE_EMAIL);
        const passwordGuardada = await SecureStore.getItemAsync(CLAVE_PASSWORD);
        if (emailGuardado && passwordGuardada) {
          reset({ email: emailGuardado, password: passwordGuardada }); // rellena los campos
          setRemember(true);                                           // deja el checkbox tildado
        }
      } catch (error) {
        console.log('No se pudieron cargar los datos guardados:', error);
      }
    };
    cargarDatosGuardados();
  }, []);

  // Guarda o borra los datos según el checkbox "Recordarme"
  const actualizarDatosGuardados = async (email, password) => {
    try {
      if (remember) {
        await SecureStore.setItemAsync(CLAVE_EMAIL, email);
        await SecureStore.setItemAsync(CLAVE_PASSWORD, password);
      } else {
        await SecureStore.deleteItemAsync(CLAVE_EMAIL);
        await SecureStore.deleteItemAsync(CLAVE_PASSWORD);
      }
    } catch (error) {
      console.log('No se pudieron guardar los datos:', error);
    }
  };

  // ENVÍO DEL FORMULARIO:  Solo se ejecuta si la validación de zod pasó correctamente
  const onSubmit = async ({ email, password }) => {
    setLoginError(null); // limpia el error del intento anterior
    setMostrarExito?.(true); // si el login sale bien, se mostrará la pantalla de éxito
    try {
      // Intenta iniciar sesión en Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Solo si el login fue correcto se guardan (o borran) los datos de "Recordarme"
      await actualizarDatosGuardados(email.trim(), password);
      // Navigation detecta la sesión y muestra la pantalla de login exitoso.
    } catch (error) {
      setMostrarExito?.(false); // el login falló: no mostrar la pantalla de éxito
      console.log('Error de inicio de sesión:', error.code, error.message);
      switch (error.code) {
        case 'auth/invalid-email':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setLoginError({
            message: 'Correo o contraseña incorrectos. Intente nuevamente.',
            fields: true,
          });
          break;
        case 'auth/network-request-failed':
          setLoginError({ message: 'Error de conexión, por favor intenta más tarde.', fields: false });
          break;
        case 'auth/invalid-api-key':
          setLoginError({ message: 'La clave API de Firebase no es válida. Revisa el archivo .env.', fields: false });
          break;
        default:
          setLoginError({ message: 'Hubo un problema al iniciar sesión.', fields: false });
      }
    }
  };

  // El botón solo se habilita si los dos campos están completos
  const [emailActual, passwordActual] = watch(['email', 'password']);
  const camposCompletos = emailActual.trim().length > 0 && passwordActual.length > 0;

// Un campo se pinta rojo solo si tiene un error de formato (no si está vacío) o si falló el login
const emailRojo = (!!errors.email && emailActual.trim() !== '') || !!loginError?.fields;
const passRojo = (!!errors.password && passwordActual !== '') || !!loginError?.fields;

  // INTERFAZ
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Image
        source={require('../assets/logo.png')}
        style={[styles.logo, loginError && { marginBottom: 20 }]}
      />

      {/* Banner de error de login (solo aparece si falló el inicio de sesión) */}
            {loginError && <MensajeError tipo="banner" mensaje={loginError.message} />}

      {/* ---------- NOTA DE CAMPOS OBLIGATORIOS (antes de los campos) ---------- */}
      <Text style={styles.requiredNote}>
        Los campos (<Text style={styles.asterisk}>*</Text>) son obligatorios
      </Text>

      <Text style={styles.label}>
        Correo electrónico <Text style={styles.asterisk}>*</Text>
      </Text>
      <View style={[styles.inputContainer, emailRojo && styles.inputError]}>
        {/* Ícono del sobre: rojo si hay error, gris si no */}
        <FontAwesome name="envelope" size={15} color={emailRojo ? '#e05252' : '#ccc'} style={styles.icon} />

        {/* Controller conecta este TextInput con el campo "email" del formulario */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="usuario@correo.com"
              value={value}                          // valor guardado en el formulario
              onChangeText={onChange}                // actualiza el formulario al escribir
              onBlur={onBlur}                        // avisa cuando el usuario sale del campo
              keyboardType="email-address"           // teclado con arroba
              autoCapitalize="none"                  // sin mayúscula inicial
              onFocus={() => {clearErrors('email'); setLoginError(null); }}   // borra el error al tocar el campo
            />
          )}
        />
      </View>
      {/* Solo se muestra si hay error Y el campo no está vacío (el vacío lo maneja el botón deshabilitado) */}
      {errors.email && emailActual.trim() !== '' && <MensajeError mensaje={errors.email.message} />}
      <Text style={styles.label}>
          Contraseña <Text style={styles.asterisk}>*</Text>
      </Text>
      {/* Caja del campo: el borde se pone rojo si hay error en la contraseña */}
      <View style={[styles.inputContainer, passRojo && styles.inputError]}>
        {/* Ícono del candado */}
        <FontAwesome name="lock" size={17} color={passRojo ? '#e05252' : '#ccc'} style={styles.icon} />

        {/* Controller conecta este TextInput con el campo "password" del formulario */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="********"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onFocus={() => {clearErrors('password'); setLoginError(null);}}   // borra el error al tocar el campo
              secureTextEntry={!showPassword}           // oculta los caracteres si showPassword es false
            />
          )}
        />
        {/* Botón del ojo: muestra u oculta la contraseña */}
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={17} color={passRojo ? '#e05252' : '#ccc'} />
        </TouchableOpacity>
      </View>
      {/* ---------- OPCIONES: RECORDARME / OLVIDÉ MI CONTRASEÑA ---------- */}
      <View style={styles.rowOptions}>
        {/* Checkbox: al tocarlo invierte el estado "remember" */}
        <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)}>
          <FontAwesome
            name={remember ? 'check-square-o' : 'square-o'}   // tildado o vacío según el estado
            size={18}
            color="#333"/>
          <Text style={styles.rememberText}>Recordar</Text>
        </TouchableOpacity>

        {/* Enlace de recuperación (por ahora solo muestra una alerta) */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    {/* ---------- BOTÓN INICIAR SESIÓN ---------- */}
      {/* Deshabilitado hasta que se completen los dos campos */}
      <TouchableOpacity
        style={[styles.button, !camposCompletos && styles.buttonDeshabilitado]}
        onPress={handleSubmit(onSubmit)}
        disabled={!camposCompletos}
      >
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      {/* ---------- ENLACE A REGISTRO ---------- */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          ¿No tienes una cuenta? <Text style={styles.signUpBold}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 90,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  logo: {
    width: 340,
    height: 140,
    resizeMode: "contain",
    marginBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0b2f5b',
  },
  asterisk: {
    color: '#d32f2f',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#0b2f5b',
    marginBottom: 20,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  rowOptions:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    marginTop: 7,
    }, 
  rememberRow:{
    flexDirection: "row",
    alignItems: "center",
    },  
  rememberText:{
    marginLeft: 6,
    fontSize: 15,
    },
  forgotText:{
    fontSize: 15,
    fontWeight: 'bold',
    color:'#0b2f5b',
    },      
  button: {
    backgroundColor: '#4e7246',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 70,
    width: "85%",
    alignItems: "center"
  },
  buttonDeshabilitado: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#0b2f5b',
    fontSize: 16,
  },
  signUpBold: {
    fontWeight:"bold",
  },
  requiredNote: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    fontSize: 14,
    color: "#333"
  },
  inputError: {
    borderColor: '#e05252',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#e05252',
    fontSize: 14,
    marginLeft: 10,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: -14,
    marginBottom: 15,
  },
    banner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fdecec',
    borderColor: '#e05252',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  bannerText: {
    flex: 1,
    color: '#e05252',
    fontSize: 14,
    marginLeft: 10,
  },
});