import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { theme } from '../config/colors';
import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Librerías nativas
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const LOGIN_USER = gql`
  mutation AutenticarUsuarios($input: AutenticarInput!) {
    autenticarUsuarios(input: $input) {
      token
      usuario {
        id
        email
        nombre
      }
    }
  }
`;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [loginUser, { loading }] = useMutation(LOGIN_USER);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      const { data } = await loginUser({
        variables: {
          input: { email, password }
        }
      });

      const token = data?.autenticarUsuarios?.token;
      const usuario = data?.autenticarUsuarios?.usuario;
      
      if (token) {
        await AsyncStorage.setItem('token', token);
        if (usuario) {
          await AsyncStorage.setItem('usuarioId', usuario.id);
          await AsyncStorage.setItem('usuarioEmail', usuario.email);
          await AsyncStorage.setItem('usuarioNombre', usuario.nombre);
        }

        const preferencias = await AsyncStorage.getItem('preferenciasGuardadas');
        if (preferencias === 'true') {
          navigation.replace('MainApp');
        } else {
          navigation.replace('Generos');
        }
      } else {
        Alert.alert('Error', 'No se recibió un token válido');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <LinearGradient
      colors={['#4facfe', '#8e44ad']} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/logo2.png')} 
            style={[theme.logo, styles.logo]} 
          />
          <Text style={styles.title}>Take a Break</Text>
          
          {/* Tarjeta de Vidrio (Estilo Sutil) */}
          <View style={[
            styles.glassContainer,
            dimensions.width > 500 && { maxWidth: 500 }
          ]}>
            
            {/* Fondo borroso reducido para evitar brillo excesivo */}
            <BlurView
              style={styles.absoluteBlur}
              blurType="light"
              blurAmount={6} 
              reducedTransparencyFallbackColor="white"
            />

            <View style={styles.formContent}>
              <Text style={styles.header}>Iniciar Sesión</Text>
              
              <Input
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                placeholder="Ingresa tu correo"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                // Estilos actualizados tipo cápsula
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
              />

              <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                // Estilos actualizados tipo cápsula
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
                autoCapitalize="none"
              />

              <View style={styles.buttonGroup}>
                <Button
                  title={loading ? "Cargando..." : "Iniciar Sesión"}
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.btnPrimary}
                  textStyle={styles.btnPrimaryText}
                />

                <Button
                  title="Regresar"
                  onPress={() => navigation.goBack()}
                  style={styles.btnSecondary}
                  textStyle={styles.btnSecondaryText}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  
  // --- Tarjeta Glassmorphism (Igual que Registro) ---
  glassContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)', // Borde sutil
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo muy transparente
  },
  absoluteBlur: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
  },
  formContent: {
    padding: 25,
  },
  header: {
    fontSize: 24,
    marginBottom: 25,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 5,
  },

  // --- INPUTS (Estilo Cápsula Limpia) ---
  inputWrapper: {
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderWidth: 0, 
  },
  labelStyle: {
    color: '#FFFFFF', 
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowRadius: 2,
  },
  inputField: {
    backgroundColor: '#FFFFFF', // Blanco sólido
    borderRadius: 12,
    color: '#333333', // Texto negro
    fontSize: 16,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // --- BOTONES ---
  buttonGroup: {
    marginTop: 10,
    gap: 15,
  },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#8e44ad',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;