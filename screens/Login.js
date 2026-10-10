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

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }

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
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>
          Contraseña <Text style={styles.asterisk}>*</Text>
      </Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderColor: '#333',
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
    marginTop: 40,
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
    marginTop: 150,
    fontSize: 11,
    color: "#333"
  },

});
