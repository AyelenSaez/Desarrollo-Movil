import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth } from '../src/config/firebaseConfig';
import MensajeError from '../components/MensajeError';
import { useNotificacion } from '../components/Notificacion';
 
// ESQUEMA DE VALIDACIÓN (zod)
// Solo se pide el correo: no puede estar vacío y debe tener formato válido.
const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Este campo es obligatorio')
    .email('El formato del correo electrónico no es válido'),
});
 
export default function ForgotPassword({ navigation }) {
  // ESTADOS LOCALES
  const [enviado, setEnviado] = useState(false);          // false = pantalla del formulario, true = pantalla "Revise su correo"
  const [emailEnviado, setEmailEnviado] = useState('');   // correo al que se mandó el enlace (se usa para reenviar)
  const [envioError, setEnvioError] = useState(null);     // mensaje de error del envío (conexión, demasiados intentos, etc.)
  const [enviando, setEnviando] = useState(false);        // true mientras se espera la respuesta de Firebase
  const { mostrarNotificacion } = useNotificacion();      // avisos en pantalla (S3-08)
 
  // CONFIGURACIÓN DEL FORMULARIO (react-hook-form)
  const {
    control,
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  // El botón solo se habilita cuando el campo tiene un correo válido
  const correoValido = forgotSchema.safeParse({ email: watch('email') }).success;
 
  // PEDIR EL ENLACE A FIREBASE
  // Devuelve null si salió bien, o el texto del error si falló.
  const pedirEnlace = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return null;
    } catch (error) {
      console.log('Error al enviar el enlace:', error.code, error.message);
      switch (error.code) {
        case 'auth/user-not-found':
          // No se avisa si el correo no existe, para no revelar qué cuentas están registradas.
          return null;
        case 'auth/network-request-failed':
          return 'Error de conexión, por favor intenta más tarde.';
        case 'auth/too-many-requests':
          return 'Demasiados intentos. Intente nuevamente más tarde.';
        default:
          return 'No se pudo enviar el enlace. Intente nuevamente.';
      }
    }
  };
 
  // ENVÍO DEL FORMULARIO: solo se ejecuta si la validación de zod pasó correctamente
  const onSubmit = async ({ email }) => {
    setEnvioError(null);
    setEnviando(true);
    const mensaje = await pedirEnlace(email.trim());
    setEnviando(false);
    if (mensaje) {
      setEnvioError(mensaje);   // falló: se muestra el banner y se queda en el formulario
      return;
    }
    setEmailEnviado(email.trim());
    setEnviado(true);           // salió bien: se pasa a la pantalla "Revise su correo"
    mostrarNotificacion('Enlace enviado. Revise su bandeja de entrada o spam.', 'exito');
  };
 
  // REENVIAR: vuelve a pedir el enlace al mismo correo
  const reenviar = async () => {
    if (enviando) return;
    setEnviando(true);
    const mensaje = await pedirEnlace(emailEnviado);
    setEnviando(false);
    if (mensaje) {
      mostrarNotificacion(mensaje, 'error');
    } else {
      mostrarNotificacion('Enlace reenviado. Revise su bandeja de entrada o spam.', 'exito');
    }
  };
 
  // PANTALL: "Revise su correo" (después de enviar el enlace)
  if (enviado) {
    return (
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={[styles.container, styles.containerCentrado]}>
          {/* Círculo azul con el ícono del correo */}
          <View style={styles.iconoCirculo}>
            <FontAwesome name="envelope-o" size={34} color="#fff" />
          </View>
 
          <Text style={styles.tituloCentrado}>Revise su correo</Text>
          <Text style={styles.textoCentrado}>
            Le enviamos un enlace para restablecer su contraseña. Revise su bandeja de entrada o spam.
          </Text>
 
          {/* Vuelve a la pantalla de login */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
 
          <Text style={styles.reenviarTexto}>
            ¿No recibió el correo?{' '}
            <Text style={styles.reenviarBold} onPress={reenviar}>Reenviar</Text>
          </Text>
        </ScrollView>
      </View>
    );
  }
 
  // PANTALLA: formulario para pedir el enlace
  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        {/* Línea azul debajo del logo */}
        <View style={styles.linea} />
 
        <Text style={styles.titulo}>¿Olvidó su contraseña?</Text>
        <Text style={styles.subtitulo}>
          Escriba su correo para enviarle un enlace de recuperación.
        </Text>
 
        {/* Banner de error del envío (solo aparece si falló) */}
        {envioError && <MensajeError tipo="banner" mensaje={envioError} />}

        {/* Nota de campos obligatorios (antes de los campos, igual que en el Login) */}
        <Text style={styles.requiredNote}>
          Los campos (<Text style={styles.asterisk}>*</Text>) son obligatorios
        </Text>

        <Text style={styles.label}>
          Correo electrónico <Text style={styles.asterisk}>*</Text>
        </Text>
        {/* Caja del campo: el borde se pone rojo si falló el envío */}
        <View style={[styles.inputBox, envioError && styles.inputError]}>
          <FontAwesome
            name="envelope-o"
            size={16}
            color={envioError ? '#e05252' : '#0b2f5b'}
            style={styles.icon}
          />
          {/* Controller conecta este TextInput con el campo "email" del formulario */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEnvioError(null)}
              />
            )}
          />
        </View>
        {/* Botón "Enviar enlace": deshabilitado hasta que se escriba un correo válido */}
        <TouchableOpacity
          style={[styles.button, (enviando || !correoValido) && styles.buttonDeshabilitado]}
          onPress={handleSubmit(onSubmit)}
          disabled={enviando || !correoValido}
        >
          <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Enviar enlace'}</Text>
        </TouchableOpacity>
 
        {/* Vuelve a la pantalla de login */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.volverTexto}>Volver a iniciar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  containerCentrado: {
    paddingTop: 90,
  },
  logo: {
    width: 300,
    height: 110,
    resizeMode: 'contain',
  },
  linea: {
    width: 150,
    height: 1.5,
    backgroundColor: '#0b2f5b',
    marginTop: 4,
    marginBottom: 40,
  },
  titulo: {
    alignSelf: 'flex-start',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0b2f5b',
    marginBottom: 12,
  },
  subtitulo: {
    alignSelf: 'flex-start',
    fontSize: 18,
    color: '#0b2f5b',
    marginBottom: 30,
  },
  requiredNote: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  asterisk: {
    color: '#d32f2f',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b2f5b',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#0b2f5b',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  inputError: {
    borderColor: '#e05252',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4e7246',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 30,
    width: '85%',
    alignItems: 'center',
  },
  buttonDeshabilitado: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  volverTexto: {
    marginTop: 20,
    color: '#0b2f5b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Pantalla "Revise su correo"
  iconoCirculo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0b2f5b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  tituloCentrado: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0b2f5b',
    textAlign: 'center',
    marginBottom: 20,
  },
  textoCentrado: {
    fontSize: 18,
    color: '#0b2f5b',
    textAlign: 'center',
    marginBottom: 60,
  },
  reenviarTexto: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  reenviarBold: {
    fontWeight: 'bold',
    color: '#0b2f5b',
  },
});