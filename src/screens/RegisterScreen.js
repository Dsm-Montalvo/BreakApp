import React, { useState, useEffect } from 'react';
import { View, Image, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';
import { gql, useMutation } from '@apollo/client';

const NUEVA_CUENTA = gql`
  mutation crearUsuarios($input: UsuariosInput) {
    crearUsuarios(input: $input)
  }
`;

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    sexo: '',
    email: '',
    password: '',
    // Autorrelleno de plataforma
    plataforma: ['Movil'],
  });

  const [crearUsuarios] = useMutation(NUEVA_CUENTA);
  const [loading, setLoading] = useState(false);

  // Por si en algún momento se reinicia el estado, garantizamos el autorrelleno
  useEffect(() => {
    if (!formData.plataforma || formData.plataforma.length === 0) {
      setFormData(prev => ({ ...prev, plataforma: ['Movil'] }));
    }
  }, [formData.plataforma]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    const { nombre, apellido, email, password, edad, sexo, plataforma } = formData;

    if (!nombre || !apellido || !email || !password || !edad || !sexo) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!plataforma || plataforma.length === 0) {
      Alert.alert('Error', 'No se pudo establecer la plataforma. Intenta de nuevo.');
      return;
    }

    setLoading(true);
    try {
      await crearUsuarios({
        variables: {
          input: {
            nombre,
            apellido,
            email,
            password,
            sexo,
            edad: parseInt(edad),
            plataforma, // ['Movil']
          }
        }
      });

      Alert.alert('Éxito', 'Registro exitoso. Por favor inicia sesión.');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
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

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Registro</Text>
        <Image source={require('../assets/images/logo2.png')} style={[theme.logo, styles.logo]} />

        <View style={styles.formContainer}>
          <Input
            label="Nombre*"
            value={formData.nombre}
            onChangeText={text => handleChange('nombre', text)}
            placeholder="Ingresa tu nombre"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Apellido*"
            value={formData.apellido}
            onChangeText={text => handleChange('apellido', text)}
            placeholder="Ingresa tu apellido"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Edad*"
            value={formData.edad}
            onChangeText={text => handleChange('edad', text)}
            placeholder="Ingresa tu edad"
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Sexo*"
            value={formData.sexo}
            onChangeText={text => handleChange('sexo', text)}
            placeholder="masculino/femenino/otro"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Correo electrónico*"
            value={formData.email}
            onChangeText={text => handleChange('email', text)}
            placeholder="Ingresa tu correo"
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Contraseña*"
            value={formData.password}
            onChangeText={text => handleChange('password', text)}
            placeholder="Ingresa tu contraseña"
            secureTextEntry
            containerStyle={styles.inputContainer}
          />

          <View style={styles.buttonGroup}>
            <Button
              title={loading ? "Registrando..." : "Registrarse"}
              onPress={handleRegister}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
            />
            <Button
              title="Regresar"
              onPress={() => navigation.goBack()}
              style={[styles.button, { backgroundColor: colors.secondary }]}
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
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
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
  },
  readonlyPillBox: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  readonlyPillText: {
    fontWeight: '600',
    color: '#333',
  },
  readonlyHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  buttonGroup: {
    marginTop: 20,
  },
  button: {
    marginBottom: 12,
  },
});

export default RegisterScreen;
