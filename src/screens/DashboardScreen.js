import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const handleStartChat = () => {
    navigation.navigate('Chat'); 
  };

  return (
    <LinearGradient
      colors={['#4facfe', '#8e44ad']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Tarjeta de Vidrio Informativa */}
      <View style={styles.glassCard}>
        <BlurView
          style={styles.absoluteBlur}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        
        <View style={styles.contentInner}>
          <Text style={styles.title}>Bienvenido a Take A Break</Text>
          
          <Text style={styles.description}>
            Un lugar seguro para expresar tus emociones, y descansar tu mente. Mediante recomendaciones personalizadas de música.
          </Text>

          <View style={styles.mascotContainer}>
             {/* Si tienes una imagen de mascota para el dashboard, ponla aquí, si no, usa el logo */}
             <Image 
                source={require('../assets/images/logo2.png')} 
                style={styles.mascot} 
             />
          </View>
          
          
        </View>
      </View>
    </LinearGradient>
  );
};

// Agregar opciones de navegación (Mantenemos tu lógica del drawer)
DashboardScreen.navigationOptions = ({ navigation }) => ({
  headerLeft: () => (
    <Button 
      title="☰"
      onPress={() => navigation.toggleDrawer()}
      style={{ backgroundColor: 'transparent', marginLeft: 10 }}
      textStyle={{ color: '#fff', fontSize: 24 }}
    />
  ),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4facfe', // Fallback color
  },
  glassCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  absoluteBlur: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
  },
  contentInner: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowRadius: 5,
  },
  description: {
    fontSize: 16,
    color: '#F0F0F0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  mascotContainer: {
    marginBottom: 30,
  },
  mascot: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#8e44ad',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;