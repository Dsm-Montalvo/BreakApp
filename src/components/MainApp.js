import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatHistorialScreen from '../screens/ChatHistorialScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

export const MainApp = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#3f8fd8',
          width: 280,
        },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#fff',
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        headerStyle: {
          backgroundColor: '#3f8fd8',
        },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen 
        name="Inicio" 
        component={DashboardScreen} 
        options={{
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
        name="Chat nuevo" 
        component={ChatScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="chat" size={22} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Chat" 
        component={ChatScreenWrapper}
        options={{
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