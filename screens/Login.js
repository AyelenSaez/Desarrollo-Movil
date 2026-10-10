import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth } from '../src/config/firebaseConfig';
 
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
 
export default function Login({ navigation }) {
 
  // ESTADOS LOCALES
  const [showPassword, setShowPassword] = useState(false); // true = contraseña visible
  const [remember, setRemember] = useState(false);         // estado del checkbox "Recordarme"

  // CONFIGURACIÓN DEL FORMULARIO (react-hook-form)
  const {
    control,                 // lo usa cada Controller para engancharse al formulario
    handleSubmit,            // valida y, si todo está bien, ejecuta la función de envío
    clearErrors,             // borra errores manualmente
    formState: { errors },   // objeto con los errores actuales (errors.email, errors.password)
  } = useForm({
    resolver: zodResolver(loginSchema),            // valida con el esquema de zod
    defaultValues: { email: '', password: '' },    // ambos campos arrancan vacíos
  });
 
  // ENVÍO DEL FORMULARIO:  Solo se ejecuta si la validación de zod pasó correctamente
  const onSubmit = async ({ email, password }) => {
    try {
      // Intenta iniciar sesión en Firebase
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
      // El observador de Firebase cambia la pantalla al detectar la sesión.
    } catch (error) {
      console.error('Error de inicio de sesión:', error.code, error.message);
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "La clave API de Firebase no es válida. Revisa el archivo .env.";
          break;
      }
      // Alerta con el mensaje y el código del error
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    }
  };
 
  // INTERFAZ
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.label}>
        Correo electrónico <Text style={styles.asterisk}>*</Text>
      </Text>
      <View style={[styles.inputContainer, errors.email && styles.inputError]}>
        {/* Ícono del sobre: rojo si hay error, gris si no */}
        <FontAwesome name="envelope" size={15} color={errors.email ? '#e05252' : '#ccc'} style={styles.icon} />
 
        {/* Controller conecta este TextInput con el campo "email" del formulario */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Ingrese su correo"
              value={value}                          // valor guardado en el formulario
              onChangeText={onChange}                // actualiza el formulario al escribir
              onBlur={onBlur}                        // avisa cuando el usuario sale del campo
              keyboardType="email-address"           // teclado con arroba
              autoCapitalize="none"                  // sin mayúscula inicial
              onFocus={() => clearErrors('email')}   // borra el error al tocar el campo
            />
          )}
        />
      </View>
      {/* Mensaje de error del correo (solo aparece si hay error) */}
      {errors.email && (
        <View style={styles.errorRow}>
          <FontAwesome name="exclamation-circle" size={15} color="#e05252" />
          <Text style={styles.errorText}>{errors.email.message}</Text>
        </View>
      )}

      <Text style={styles.label}>
          Contraseña <Text style={styles.asterisk}>*</Text>
      </Text>
      {/* Caja del campo: el borde se pone rojo si hay error en la contraseña */}
      <View style={[styles.inputContainer, errors.password && styles.inputError]}>
        {/* Ícono del candado */}
        <FontAwesome name="lock" size={17} color={errors.password ? '#e05252' : '#ccc'} style={styles.icon} />
 
        {/* Controller conecta este TextInput con el campo "password" del formulario */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Ingrese su contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              onFocus={() => clearErrors('password')}   // borra el error al tocar el campo
              secureTextEntry={!showPassword}           // oculta los caracteres si showPassword es false
            />
          )}
        />
        {/* Botón del ojo: muestra u oculta la contraseña */}
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={17} color={errors.password ? '#e05252' : '#ccc'} />
        </TouchableOpacity>
      </View>
      {/* Mensaje de error de la contraseña (solo aparece si hay error) */}
      {errors.password && (
        <View style={styles.errorRow}>
          <FontAwesome name="exclamation-circle" size={15} color="#e05252" />
          <Text style={styles.errorText}>{errors.password.message}</Text>
        </View>
      )}
      {/* ---------- OPCIONES: RECORDARME / OLVIDÉ MI CONTRASEÑA ---------- */}
      <View style={styles.rowOptions}>
        {/* Checkbox: al tocarlo invierte el estado "remember" */}
        <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)}>
          <FontAwesome
            name={remember ? 'check-square-o' : 'square-o'}   // tildado o vacío según el estado
            size={18}
            color="#333"/>
          <Text style={styles.rememberText}>Recordarme</Text>
        </TouchableOpacity>
 
        {/* Enlace de recuperación (por ahora solo muestra una alerta) */}
        <TouchableOpacity onPress={() => Alert.alert('Recuperar contraseña')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
      {/* ---------- BOTÓN INICIAR SESIÓN ---------- */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      {/* ---------- ENLACE A REGISTRO ---------- */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          ¿No tienes una cuenta? <Text style={styles.signUpBold}>Regístrate</Text>
        </Text>
      </TouchableOpacity>
      {/* ---------- NOTA DE CAMPOS OBLIGATORIOS ---------- */}
      <Text style={styles.requiredNote}>
        Los campos (<Text style={styles.asterisk}>*</Text>) son obligatorios
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 90,
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
    fontSize: 16,
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
    height: 40,
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
    fontSize: 13,
    },
  forgotText:{
    fontSize: 13,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#0b2f5b',
    fontSize:14,
  },
  signUpBold: {
    fontWeight:"bold",
  },
  requiredNote: {
    marginTop: 100,
    fontSize: 11,
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
});