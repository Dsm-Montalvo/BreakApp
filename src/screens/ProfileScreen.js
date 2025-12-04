import React, { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated, ScrollView, RefreshControl, ActivityIndicator, Image, Button } from 'react-native';
import { colors } from '../config/colors';
import { gql, useQuery } from '@apollo/client'
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

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

const ProfileScreen = ({ navigation }) => {

    const handleStartChat = () => {
      navigation.navigate('Generos'); 
    };
    const [refreshing, setRefreshing] = useState(false);
    
    // Apollo
    const { data, error, loading, refetch } = useQuery(OBTENER_USUARIO, {
        notifyOnNetworkStatusChange: true
    })

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error("Error al recargar datos:", error);
        }
        setRefreshing(false);
    };

    if (loading) {
        return (
            <LinearGradient colors={['#4facfe', '#8e44ad']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#4facfe', '#8e44ad']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.mainTitle}>Mi Perfil</Text>

                <View style={styles.glassCard}>
                    <BlurView
                        style={styles.absoluteBlur}
                        blurType="light"
                        blurAmount={10}
                        reducedTransparencyFallbackColor="white"
                    />

                    <View style={styles.formContent}>
                        {data && data.obtenerUsuarios.map(usuarios => (
                            <View key={usuarios.id}>
                                {/* Avatar Circular */}
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarText}>
                                            {usuarios.nombre ? usuarios.nombre.charAt(0).toUpperCase() : '?'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Campos del Formulario */}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Nombre</Text>
                                    <TextInput style={styles.inputField} value={usuarios.nombre} editable={false} />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Apellidos</Text>
                                    <TextInput style={styles.inputField} value={usuarios.apellido} editable={false} />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Edad</Text>
                                    <TextInput style={styles.inputField} value={usuarios.edad ? usuarios.edad.toString() : ''} editable={false} />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Sexo</Text>
                                    <TextInput style={styles.inputField} value={usuarios.sexo} editable={false} />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput style={styles.inputField} value={usuarios.email} editable={false} />
                                </View>
                                
                                <Button 
                                  title="Cambiar Preferencias" 
                                  onPress={handleStartChat}
                                  style={styles.btnPrimar2y}
                                  textStyle={styles.btnPrimaryText2}
                                />
                            </View>
                        ))}

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity style={styles.btnSecondary}>
                                <Text style={styles.btnSecondaryText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnPrimary}>
                                <Text style={styles.btnPrimaryText}>Editar Perfil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4facfe',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    btnPrimary2: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
   },
   btnPrimaryText2: {
    color: '#8e44ad',
    fontWeight: 'bold',
    fontSize: 16,
  },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 20,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowRadius: 5,
    },
    // Glass Card
    glassCard: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 25,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 20,
    },
    absoluteBlur: {
        position: 'absolute',
        top: 0, left: 0, bottom: 0, right: 0,
    },
    formContent: {
        padding: 25,
    },
    // Avatar
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#8e44ad',
    },
    // Inputs
    inputWrapper: {
        marginBottom: 15,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 5,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowRadius: 2,
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        color: '#333333',
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        height: 50,
    },
    // Botones
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    btnPrimary: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    btnPrimaryText: {
        color: '#8e44ad',
        fontWeight: 'bold',
        fontSize: 16,
    },
    btnSecondary: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnSecondaryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProfileScreen;