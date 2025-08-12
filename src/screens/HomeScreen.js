import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />
      <View style={styles.contentBox}>
        <Text style={styles.title}>Take a Break</Text>
        <Text style={styles.subtitle}>Tu momento para respirar y avanzar.</Text>
        <Image 
          source={require('../assets/images/logo2.png')} 
          style={[theme.logo, styles.logo]} 
        />
        <View style={styles.buttonContainer}>
          <Button 
            title="Iniciar Sesión" 
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, { backgroundColor: colors.primary }]}
          />
          <Button 
            title="Registrarse" 
            onPress={() => navigation.navigate('Register')}
            style={[styles.button, { backgroundColor: colors.secondary }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  contentBox: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.subbox,
    borderRadius: 15,
    padding: 30,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    color: colors.tittle,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  subtitle: {
    fontSize: 28,
    color: colors.subtittle,
    fontWeight: '300',
    paddingLeft: 29,
    marginBottom: 30,
  },
  logo: {
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginVertical: 10,
  },
});

export default HomeScreen;