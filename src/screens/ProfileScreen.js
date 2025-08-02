import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../config/colors';
import { useQuery, useMutation, gql } from '@apollo/client';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Consulta GraphQL para obtener datos del usuario
const GET_USER_DATA = gql`
  query ObtenerUsuario {
    obtenerUsuarios {
      id
      nombre
      email
      telefono
      direccion
    }
  }
`;

// Mutación GraphQL para actualizar datos
const UPDATE_USER_DATA = gql`
  mutation ActualizarUsuario($input: UsuarioInput) {
    actualizarUsuario(input: $input) {
      id
      nombre
      email
      telefono
      direccion
    }
  }
`;

const ProfileScreen = ({ navigation }) => {
  const [editable, setEditable] = useState(false);
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  // Obtener datos del usuario
  const { loading, error, data } = useQuery(GET_USER_DATA, {
    onCompleted: (data) => {
      if (data?.obtenerUsuarios) {
        setUserData(data.obtenerUsuarios[0]);
      }
    },
    fetchPolicy: 'network-only'
  });

  // Mutación para actualizar datos
  const [updateUser] = useMutation(UPDATE_USER_DATA, {
    onCompleted: (data) => {
      Alert.alert('Éxito', 'Datos actualizados correctamente');
      setEditable(false);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleInputChange = (name, value) => {
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateUser({
      variables: {
        input: {
          ...userData
        }
      }
    });
  };

  if (loading) return <Text style={styles.loading}>Cargando datos...</Text>;
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Información del Usuario</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput
            style={styles.input}
            value={userData.nombre}
            onChangeText={(text) => handleInputChange('nombre', text)}
            editable={editable}
            placeholder="Nombre completo"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            editable={editable}
            keyboardType="email-address"
            placeholder="Correo electrónico"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={userData.telefono}
            onChangeText={(text) => handleInputChange('telefono', text)}
            editable={editable}
            keyboardType="phone-pad"
            placeholder="Número de teléfono"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dirección:</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={userData.direccion}
            onChangeText={(text) => handleInputChange('direccion', text)}
            editable={editable}
            multiline
            placeholder="Dirección completa"
          />
        </View>

        <View style={styles.buttonContainer}>
          {editable ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
              >
                <Icon name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditable(false)}
              >
                <Icon name="cancel" size={20} color="#fff" />
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.editButton]} 
              onPress={() => setEditable(true)}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
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
    overflow: 'hidden',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'white',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
    marginVertical: 10,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  loading: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProfileScreen;