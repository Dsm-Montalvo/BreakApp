import React, { useState, useEffect } from 'react';
import { View, Image, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { theme } from '../config/colors';
import { gql, useMutation } from '@apollo/client';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

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
    plataforma: ['Movil'],
  });

  const [crearUsuarios] = useMutation(NUEVA_CUENTA);
  const [loading, setLoading] = useState(false);

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
            plataforma,
          }
        }
      });
      Alert.alert('Éxito', 'Registro exitoso. Por favor inicia sesión.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Ocurrió un error al registrar');
    } finally {
      setLoading(false);
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
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.mainTitle}>Registro</Text>
          
          <Image 
            source={require('../assets/images/logo2.png')} 
            style={[theme.logo, styles.logo]} 
          />

          {/* Tarjeta Glassmorphism (Más sutil ahora) */}
          <View style={styles.glassContainer}>
            
            <BlurView
              style={styles.absoluteBlur}
              blurType="light"
              blurAmount={6} // Menos desenfoque para reducir brillo excesivo
              reducedTransparencyFallbackColor="white"
            />

            <View style={styles.formContent}>
              <Input
                label="Nombre*"
                value={formData.nombre}
                onChangeText={text => handleChange('nombre', text)}
                placeholder="Ingresa tu nombre"
                placeholderTextColor="#A0A0A0"
                // Truco: container transparente, input blanco sólido
                containerStyle={styles.inputWrapper} 
                inputStyle={styles.inputField} 
                labelStyle={styles.labelStyle}
              />

              <Input
                label="Apellido*"
                value={formData.apellido}
                onChangeText={text => handleChange('apellido', text)}
                placeholder="Ingresa tu apellido"
                placeholderTextColor="#A0A0A0"
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
              />

              <Input
                label="Edad*"
                value={formData.edad}
                onChangeText={text => handleChange('edad', text)}
                placeholder="Ej: 25"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
              />

              <Input
                label="Sexo*"
                value={formData.sexo}
                onChangeText={text => handleChange('sexo', text)}
                placeholder="Masculino / Femenino"
                placeholderTextColor="#A0A0A0"
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
              />

              <Input
                label="Correo electrónico*"
                value={formData.email}
                onChangeText={text => handleChange('email', text)}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
              />

              <Input
                label="Contraseña*"
                value={formData.password}
                onChangeText={text => handleChange('password', text)}
                placeholder="********"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                containerStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                labelStyle={styles.labelStyle}
              />

              <View style={styles.buttonGroup}>
                <Button
                  title={loading ? "Registrando..." : "Registrarse"}
                  onPress={handleRegister}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    marginBottom: 10,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  
  // --- Tarjeta de Vidrio (Ajustada para menos brillo) ---
  glassContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)', // Borde más suave
    position: 'relative',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fondo MUY transparente para evitar el "blanco sobre blanco"
  },
  absoluteBlur: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
  },
  formContent: {
    padding: 20,
  },
  
  // --- INPUTS: Separación visual clave ---
  // 1. El wrapper solo da espacio, es transparente
  inputWrapper: {
    marginBottom: 15,
    backgroundColor: 'transparent', 
    borderWidth: 0, // Quitamos bordes del contenedor general para evitar "doble caja"
  },
  
  // 2. El estilo del label (Nombre, Apellido) es Blanco y está FUERA de la caja
  labelStyle: {
    color: '#FFFFFF', 
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowRadius: 2,
  },

  // 3. El campo de texto en sí es la "caja blanca"
  inputField: {
    backgroundColor: '#FFFFFF', // Fondo blanco limpio
    borderRadius: 12,           // Bordes redondeados
    color: '#333333',           // Texto negro
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,        // Altura cómoda
    height: 50,
    // Sombra muy suave solo en el input
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  // --- BOTONES ---
  buttonGroup: {
    marginTop: 15,
    gap: 12,
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
    borderColor: 'rgba(255,255,255, 0.6)',
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

export default RegisterScreen;