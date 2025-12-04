import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Librería correcta para CLI
import { BlurView } from '@react-native-community/blur';   // Librería correcta para CLI
import Button from '../components/common/Button';
import { theme } from '../config/colors';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  return (
    // 1. Fondo Degradado usando react-native-linear-gradient
    <LinearGradient
      colors={['#4facfe', '#8e44ad']} // Tonos azul a morado
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* 2. Tarjeta de Vidrio usando @react-native-community/blur */}
      {/* Nota: blurAmount controla qué tan borroso se ve */}
      <View style={styles.cardContainer}>
        
        {/* El BlurView va como fondo absoluto dentro del contenedor */}
        <BlurView
          style={styles.absoluteBlur}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />

        {/* Contenido de la tarjeta */}
        <View style={styles.contentInner}>
          <Text style={styles.title}>Take a Break </Text>
          <Text style={styles.subtitle}>
            Tu momento para respirar, escuchar y avanzar hacia tu bienestar emocional.
          </Text>

          <Image 
            source={require('../assets/images/logo2.png')} 
            style={[theme.logo, styles.logo]} 
          />

          <View style={styles.buttonContainer}>
            {/* Botón Iniciar Sesión (Blanco) */}
            <Button 
              title="Iniciar Sesión" 
              onPress={() => navigation.navigate('Login')}
              style={styles.btnPrimary}
              textStyle={styles.btnPrimaryText} 
            />
            
            {/* Botón Registrarse (Outline) */}
            <Button 
              title="Registrarse" 
              onPress={() => navigation.navigate('Register')}
              style={styles.btnSecondary}
              textStyle={styles.btnSecondaryText}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Contenedor de la tarjeta (necesario para recortar el blur)
  cardContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 25,
    overflow: 'hidden', // Esto recorta el blur a los bordes redondeados
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  // El blur debe llenar todo el contenedor
  absoluteBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  contentInner: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Un tinte blanco extra
  },
  title: {
    fontSize: 32,
    fontWeight: 'Fredoka ',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#F0F0F0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#8e44ad',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;