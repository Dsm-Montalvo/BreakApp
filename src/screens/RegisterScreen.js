import React, { useState } from 'react';
import { View, Image, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { registerUser } from '../services/api';
import { theme, colors } from '../config/colors';

const RegisterScreen = ({ navigation }) => {
  // Estado completo del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    sexo: '',
    email: '',
    password: '',
    preferences: {
      generos: [],
      autores: []
    }
  });

  const [loading, setLoading] = useState(false);

  // Función para manejar cambios en los campos
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value.split(',').map(item => item.trim())
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  // Función para manejar el registro
  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.nombre || !formData.apellido) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      Alert.alert('Éxito', 'Registro exitoso. Por favor inicia sesión.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al registrar');
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

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        
        <Text style={styles.header}>Registro</Text>
        
        <Image 
            source={require('../assets/images/logo2.png')} 
            style={[theme.logo, styles.logo]} 
        />
        
        <View style={styles.formContainer}>
          <Input
            label="Nombre*"
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
            placeholder="Ingresa tu nombre"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Apellido*"
            value={formData.apellido}
            onChangeText={(text) => handleChange('apellido', text)}
            placeholder="Ingresa tu apellido"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Edad"
            value={formData.edad}
            onChangeText={(text) => handleChange('edad', text)}
            placeholder="Ingresa tu edad"
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Sexo"
            value={formData.sexo}
            onChangeText={(text) => handleChange('sexo', text)}
            placeholder="masculino/femenino/otro"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Correo electrónico*"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Ingresa tu correo"
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Contraseña*"
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Géneros preferidos (separados por comas)"
            value={formData.preferences.generos.join(', ')}
            onChangeText={(text) => handleChange('preferences.generos', text)}
            placeholder="ficcion, misterio, etc."
            containerStyle={styles.inputContainer}
          />
          
          <Input
            label="Autores preferidos (separados por comas)"
            value={formData.preferences.autores.join(', ')}
            onChangeText={(text) => handleChange('preferences.autores', text)}
            placeholder="Gabriel García Márquez, etc."
            containerStyle={styles.inputContainer}
          />

          <View style={styles.buttonGroup}>
          <Button 
            title={loading ? "Registrando..." : "Registrarse"} 
            onPress={handleRegister}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.secondary }]}
          />
          
          <Button 
            title="Regresar" 
            onPress={() => navigation.goBack()}
            style={[styles.button, { backgroundColor: colors.red }]}
          />
        </View>
        </View>

        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: colors.subbox,
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

export default RegisterScreen;