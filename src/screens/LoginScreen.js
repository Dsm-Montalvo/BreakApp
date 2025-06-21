import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { loginUser } from '../services/api';
import { theme, colors } from '../config/colors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >   

      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />

      <View style={styles.content}>
        <Text style={styles.title}>Take a Break</Text>
        <Text style={styles.header}>Iniciar Sesión</Text>
        
        {/* Contenedor del formulario con fondo diferente */}
        <View style={styles.formContainer}>
          <Input
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="Ingresa tu correo"
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            containerStyle={styles.inputContainer}
          />
          <View style={styles.buttonGroup}>
          <Button 
            title={loading ? "Cargando..." : "Iniciar Sesión"} 
            onPress={handleLogin}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.primary }]}
          />
          
          <Button 
            title="Regresar" 
            onPress={() => navigation.goBack()}
            style={[styles.button, { backgroundColor: colors.red }]}
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
    position: 'relative', // ✅ importante
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
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  title: {
    
    alignItems: 'center',
    fontSize: 32,
    color: colors.tittle,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: '#B42BC0', // Color de fondo claro
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    backgroundColor: colors.subbox,
    color: 'white',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    width: '100%',
  },
  button: {
    marginVertical: 10,
  },
});

export default LoginScreen;