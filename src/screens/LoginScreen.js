import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
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
      const response = await loginUser(email, password);
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={theme.container}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Iniciar Sesión</Text>
      
      <Input
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="Ingresa tu correo"
        keyboardType="email-address"
      />
      
      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Ingresa tu contraseña"
        secureTextEntry
      />
      
      <Button 
        title={loading ? "Cargando..." : "Iniciar Sesión"} 
        onPress={handleLogin}
        disabled={loading}
      />
      
      <Button 
        title="Regresar" 
        onPress={() => navigation.goBack()}
        style={{ backgroundColor: colors.gray }}
      />
    </View>
  );
};

export default LoginScreen;
