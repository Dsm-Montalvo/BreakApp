import React,{useState,useRef} from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity,Animated,ScrollView,RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '../config/colors';
import {gql,useQuery} from '@apollo/client'

const OBTENER_USUARIO = gql`
    query obtenerUsuarios {
        obtenerUsuarios {
            id
            nombre
            apellido
            edad
            sexo
            email
        }
    }
`;

const ProfileScreen = () => {
  
    const [refreshing, setRefreshing] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const animatedValue = useRef(new Animated.Value(-250)).current;

    // apollo
    const {data,error,loading,refetch} = useQuery(OBTENER_USUARIO,{
        notifyOnNetworkStatusChange:true
    })

    const onRefresh = async () => {
        setRefreshing(true);
        try {
          await refetch();  // Refetch obtiene los datos actualizados desde el servidor
        } catch (error) {
          console.error("Error al recargar datos:", error);
        }
        setRefreshing(false);
      };
      console.log(data)
      console.log(error)
      console.log(loading)

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  
    const toggleMenu = () => {
        Animated.timing(animatedValue, {
        toValue: menuVisible ? -250 : 0,
        duration: 300,
        useNativeDriver: false,
        }).start();

        setMenuVisible(!menuVisible);
    };
  return (
    <View style={styles.container}>
    <ScrollView 
             refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.container}
            >
      {/* Óvalos decorativos */}
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />

      <Text style={styles.title}>Perfil</Text>

      <View>
        {data.obtenerUsuarios.map(usuarios =>(
          <View key={usuarios.id} style={styles.formGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{usuarios.nombre}</Text>
            </View>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} >{usuarios.nombre}</TextInput>
        
            <Text style={styles.label}>Apellidos</Text>
            <TextInput style={styles.input} >{usuarios.apellido}</TextInput>
            
            <Text style={styles.label}>Edad</Text>
            <TextInput style={styles.input} >{usuarios.edad}</TextInput>
            
            <Text style={styles.label}>sexo</Text>
            <TextInput style={styles.input} >{usuarios.sexo}</TextInput>
            
            <Text style={styles.label}>email</Text>
            <TextInput style={styles.input} >{usuarios.email}</TextInput>
            
          </View>
        ))}
      </View>

      

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Cambiar</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    padding: 4,
    overflow: 'hidden',
  },
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#b8d1e7',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20,
    color: colors.primary,
    textAlign: 'center',
  },
  avatar: {
    backgroundColor: '#e9ddff',
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarText: {
    fontSize: 24,
    color: '#000000ff',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#e2e2e2',
    borderRadius: 8,
    padding: 10,
    color: '#000',
  },
  toggleWrapper: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 5,
  },
  activated: {
    backgroundColor: '#d6c4ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  deactivated: {
    backgroundColor: '#623d49',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  toggleTextActive: {
    color: '#3a2d4d',
  },
  toggleTextInactive: {
    color: '#d4b8be',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelBtn: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveBtn: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
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
    opacity: 0.7,
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
    opacity: 0.7,
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
    opacity: 0.7,
  },
});

export default ProfileScreen;