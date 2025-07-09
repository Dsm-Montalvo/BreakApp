import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../config/colors';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />
      
      
      <Text style={styles.title}>Pantalla de configuracion u otras utilidades</Text>
      {/* Aquí mostrarías los datos del usuario */}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.primary,
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
  
});

export default SettingsScreen;