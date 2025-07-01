import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../config/colors';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Información del Usuario</Text>
      {/* Aquí mostrarías los datos del usuario */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.primary,
  },
});

export default ProfileScreen;