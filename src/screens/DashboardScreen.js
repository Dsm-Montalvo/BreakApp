import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/common/Button';
import { theme, colors } from '../config/colors';

const DashboardScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Aquí puedes limpiar el estado de autenticación si es necesario
    navigation.replace('Home');
  };

  return (
    <View style={theme.container}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Bienvenido al Dashboard</Text>
      <Text style={{ marginBottom: 20 }}>Aquí puedes mostrar el contenido principal de tu aplicación.</Text>
      
      <Button 
        title="Cerrar Sesión" 
        onPress={handleLogout}
        style={{ backgroundColor: colors.error }}
      />
    </View>
  );
};

export default DashboardScreen;