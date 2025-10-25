import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';

const DashboardScreen = ({ navigation }) => {
  const handleStartChat = () => {
    navigation.navigate('Chat'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />
      
      
      <Text style={{ fontSize: 24, marginBottom: 20, color: "white" }}>Bienvenido al Dashboard</Text>
      <Text style={{ marginBottom: 20, color: "white" }}>Aqui se mostrara informacion importante al usuario por ejemplo terminos o una descripcion y el boton para iniciar un chat nuevo</Text>
      
      <Button 
        title="Iniciar Chat" 
        onPress={handleStartChat} // Cambiado a la nueva función
        style={{ backgroundColor: colors.primary }}
      />
    </View>
  );
};

// Agregar opciones de navegación para mostrar el ícono de menú
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
    backgroundColor: colors.background,
    position: 'relative',
    padding: 20,
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
  
});

export default DashboardScreen;