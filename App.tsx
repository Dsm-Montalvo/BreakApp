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

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Crear el Drawer Navigator que se usará después del login
const CustomDrawerContent = (props) => {
  return (
    <View style={styles.container}>
      {/* Contenido principal del menú */}
      <DrawerContentScrollView {...props}>
        <View style={styles.topSection}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Sección inferior separada */}
      <View style={styles.bottomSection}>
        {/* Línea divisoria */}
        <View style={styles.divider} />
        
        {/* Opción de Configuración */}
        <DrawerItem
          label="Configuración"
          icon={({ color }) => <Icon name="settings" size={22} color={color} />}
          onPress={() => props.navigation.navigate('Settings')}
          labelStyle={styles.menuItemLabel}
        />
        
        {/* Opción de Cerrar Sesión */}
        <DrawerItem
          label="Cerrar Sesión"
          icon={({ color }) => <Icon name="exit-to-app" size={22} color={color} />}
          onPress={() => {
            // Lógica para cerrar sesión
            props.navigation.replace('Home');
          }}
          labelStyle={[styles.menuItemLabel, styles.logoutLabel]}
        />
      </View>
    </View>
  );
};

const MainApp = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          //backgroundColor: '#c38aea', // Color morado
          backgroundColor:'#3f8fd8',
          width: 280,
        },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#fff',
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        headerStyle: {
          backgroundColor:'#3f8fd8',
          //backgroundColor: '#c38aea',
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
        name="Nuevo Chat" 
        component={ChatScreen} 
        options={{
          drawerIcon: ({ color }) => <Icon name="chat" size={22} color={color} />,
        }}
      />
      {/* Pantalla oculta para Configuración */}
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          drawerItemStyle: { display: 'none' } // Oculta esta opción del menú principal
        }}
      />
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          cardStyle: { backgroundColor: '#c38aea' },
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
