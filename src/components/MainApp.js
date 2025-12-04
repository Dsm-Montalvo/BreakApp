import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen'; 
import ChatScreen from '../screens/ChatScreen';
import ChatHistorialScreen from '../screens/ChatHistorialScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import HomeScreen from '../screens/HomeScreen';
import GenerosScreen from '../screens/Preferencias/GenerosScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export const MainApp = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // 1. Mantenemos el Header visible (Por defecto es true, pero lo explícito es mejor)
        headerShown: true,

        // 2. Desactivamos swipe para evitar conflictos con gestos de Android
        swipeEnabled: false,

        // 3. ESTILOS DEL HEADER (Barra superior)
        headerStyle: {
          backgroundColor: '#4facfe', // Mismo azul que el inicio de tu degradado
          elevation: 0, // Android: Quita la sombra para que se vea plano y continuo
          shadowOpacity: 0, // iOS: Quita la sombra
          borderBottomWidth: 0, // Quita la línea divisoria
        },
        headerTintColor: '#fff', // Texto e iconos blancos
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        
        // 4. ESTILOS DEL MENÚ LATERAL (Drawer)
        drawerStyle: {
          backgroundColor: '#4facfe', 
          width: 280,
        },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#e0e0e0',
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.2)', // Efecto vidrio
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: 'bold',
          marginLeft: -10,
        },
      }}
    >
      <Drawer.Screen 
        name="Inicio" 
        component={DashboardScreen} 
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color }) => <Icon name="home" size={22} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
          drawerIcon: ({ color }) => <Icon name="person" size={22} color={color} />,
        }}
      />

      <Drawer.Screen 
        name="Generos" 
        component={GenerosScreen} 
        options={{
          title: 'Preferencias',
          drawerItemStyle: { display: 'none' },
          drawerIcon: ({ color }) => <Icon name="library-music" size={22} color={color} />,
        }}
      />

      <Drawer.Screen 
        name="Chat nuevo" 
        component={ChatScreen}
        options={{
          title: 'Nuevo Chat',
          drawerIcon: ({ color }) => <Icon name="chat-bubble-outline" size={22} color={color} />,
        }}
      />
      
      {/* El Chat Wrapper se mantiene oculto del menú pero accesible */}
      <Drawer.Screen 
        name="Chat" 
        component={ChatScreenWrapper}
        options={{ 
          headerShown: false, // Al entrar al chat, ocultamos el header general para usar el propio del chat si quieres
          drawerItemStyle: { display: 'none' },
          drawerIcon: ({ color }) => <Icon name="chat" size={22} color={color} />,
        }}
      />
      
    </Drawer.Navigator>
  );
};

// Wrapper para manejar el estado global del chat
const ChatScreenWrapper = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatMain">
        {props => <ChatScreen {...props} messages={messages} setMessages={setMessages} />}
      </Stack.Screen>
      <Stack.Screen name="ChatHistorial">
        {props => <ChatHistorialScreen {...props} messages={messages} setMessages={setMessages} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};