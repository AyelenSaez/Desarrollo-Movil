import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleLogin = async () => {
  const emailVacio = !email.trim();
  const passwordVacio = !password;
  setEmailError(emailVacio);
  setPasswordError(passwordVacio);
  if (emailVacio || passwordVacio) return;

    try {
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
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <Text style={styles.label}>
        Correo electrónico <Text style={styles.asterisk}>*</Text>
      </Text>
      <View style={[styles.inputContainer, emailError && styles.inputError]}>
        <FontAwesome name="envelope" size={15} color={emailError ? '#e05252' : '#ccc'} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          value={email}
          onChangeText={(text) => { setEmail(text); setEmailError(false); }}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setEmailError(false) }/>

      </View>
      {emailError && (
        <View style={styles.errorRow}>
          <FontAwesome name="exclamation-circle" size={15} color="#e05252" />
          <Text style={styles.errorText}>Este campo es obligatorio</Text>
        </View>
      )}

      <Text style={styles.label}>
          Contraseña <Text style={styles.asterisk}>*</Text>
      </Text>
      <View style={[styles.inputContainer, passwordError && styles.inputError]}>
        <FontAwesome name="lock" size={17} color={passwordError ? '#e05252' : '#ccc'} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={(text) => { setPassword(text); setPasswordError(false); }}
          onFocus={() => setPasswordError(false) }
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={17} color={passwordError ? '#e05252' : '#ccc'} />
        </TouchableOpacity>
      </View>
      {passwordError && (
        <View style={styles.errorRow}>
          <FontAwesome name="exclamation-circle" size={15} color="#e05252" />
          <Text style={styles.errorText}>Este campo es obligatorio</Text>
        </View>
      )}
      <View style={styles.rowOptions}>
        <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)}>
          <FontAwesome
            name={remember ? 'check-square-o' : 'square-o'}
            size={18}
            color="#333"/>
          <Text style={styles.rememberText}>Recordarme</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Recuperar contraseña')}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>
          ¿No tienes una cuenta? <Text style={styles.signUpBold}>Regístrate</Text>
        </Text>
      </TouchableOpacity>

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
