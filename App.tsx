import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ChatScreen from './src/screens/ChatScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import { MainApp } from './src/components/MainApp';
import GenerosScreen from './src/screens/Preferencias/GenerosScreen';


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

<CustomDrawerContent/>


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          cardStyle: { backgroundColor: '#8fbfed' },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
          headerStyle: {
            backgroundColor: '#8fbfed',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Iniciar Sesión' }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Registro' }} 
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainApp} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
  name="Generos" 
  component={GenerosScreen} 
  options={{ title: 'Preferencias' }} 
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // Separa las secciones
  },
  topSection: {
    flex: 1, // Ocupa todo el espacio disponible
  },
  bottomSection: {
    marginBottom: 20, // Espacio en la parte inferior
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  menuItemLabel: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: -10,
  },
  logoutLabel: {
    color: '#ff5252', // Color rojo para Cerrar Sesión
  },
});


export default App;
