import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>Take a Break</Text>
        <Text style={styles.subtitle}>Tu momento para respirar y avanzar.</Text>
        <Image 
          source={require('../assets/images/logo.png')} 
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
  },
  title: {
    fontSize: 32,
    color: colors.tittle,
    fontWeight: 'bold',
    marginBottom: 10,
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