import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';
import { gql, useMutation } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          input: {
            email,
            password
          }
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
}
 else {
        Alert.alert('Error', 'No se recibió un token válido');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />

      <View style={styles.content}>
        <Image 
          source={require('../assets/images/logo2.png')} 
          style={[theme.logo, styles.logo]} 
        />
        <Text style={styles.title}>Take a Break</Text>
        
       {/* ************************              *****************************   */}  
        <View style={[
          styles.formContainer,
          dimensions.width > 500 && { padding: 40, maxWidth: 500 }
        ]}>
          <Text style={styles.header}>Iniciar Sesión</Text>
          
          <Input
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu correo"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor="#000000"
            labelStyle={styles.labelStyle}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor="#777"
            labelStyle={styles.labelStyle}
            autoCapitalize="none"
            returnKeyType="done"
          />

          <View style={styles.buttonGroup}>
            <Button
              title={loading ? "Cargando..." : "Iniciar Sesión"}
              onPress={handleLogin}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
              textStyle={styles.buttonText}
            />

            <Button
              title="Regresar"
              onPress={() => navigation.goBack()}
              style={[styles.button, { backgroundColor: colors.secondary }]}
              textStyle={styles.buttonText}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  oval1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#78C9DC',
    top: -40,
    left: -40,
    zIndex: 0,
  },
  oval2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#DA96BB',
    bottom: -30,
    left: -50,
    zIndex: 0,
  },
  oval3: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#4449D8',
    bottom: -20,
    right: -30,
    zIndex: 0,
  },
  content: {
    padding: 20,
    zIndex: 1,
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 40,
    color: colors.tittle,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: '#64a6e3',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
  },
  inputContainer: {
    backgroundColor: colors.subbox,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputText: {
    color: 'black',
    fontSize: 16,
  },
  labelStyle: {
    color: 'black',
    marginBottom: 5,
    fontWeight: '600',
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;