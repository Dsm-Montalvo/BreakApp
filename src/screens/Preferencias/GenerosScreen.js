import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Dimensions
} from 'react-native';
import { gql, useMutation, useQuery } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
// Nota: No usamos BlurView en cada item de la lista por rendimiento, 
// pero sí mantenemos la estética limpia sobre el gradiente.

const LISTAR_SPOTIFY_GENEROS = gql`
  query listarSpotifyGeneros($limit: Int, $locale: String) {
    listarSpotifyGeneros(limit: $limit, locale: $locale) {
      id
      name
      imageUrl
    }
  }
`;

const ACTUALIZAR_PREFERENCIAS = gql`
  mutation actualizarPreferenciasUsuario($input: PreferenciasInput!) {
    actualizarPreferenciasUsuario(input: $input) {
      id
      preferences {
        generos
      }
    }
  }
`;

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT; // Ajuste para márgenes

const GenerosScreen = ({ navigation }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);

  const { data, loading, error, refetch } = useQuery(LISTAR_SPOTIFY_GENEROS, {
    variables: { limit: 40, locale: undefined },
    fetchPolicy: 'cache-first',
  });

  const [actualizarPreferencias, { loading: mutationLoading }] = useMutation(ACTUALIZAR_PREFERENCIAS);
  const genres = useMemo(() => (data?.listarSpotifyGeneros ?? []), [data]);

  const handleSelectGenre = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSaveGenres = async () => {
    if (selectedGenres.length < 1) {
      Alert.alert('Atención', 'Por favor, selecciona al menos un género.');
      return;
    }

    try {
      await actualizarPreferencias({ variables: { input: { generos: selectedGenres } } });
      await AsyncStorage.setItem('preferenciasGuardadas', 'true');
      Alert.alert('Éxito', '¡Tus géneros preferidos han sido guardados!');
      navigation.replace('MainApp');
    } catch (e) {
      console.error('Error al guardar los géneros:', e.message);
      Alert.alert('Error', 'No se pudieron guardar tus preferencias. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#4facfe', '#8e44ad']} style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white', marginTop: 10, fontWeight: '600' }}>Cargando géneros...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#4facfe', '#8e44ad']} style={[styles.container, styles.center]}>
        <Text style={{ color: 'white', marginBottom: 10 }}>Error: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
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
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.title}>Selecciona tus Géneros</Text>
        <Text style={styles.subtitle}>Elige lo que más te gusta para personalizar tu experiencia</Text>

        <FlatList
          data={genres}
          numColumns={COLUMN_COUNT}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedGenres.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.cardContainer,
                  isSelected && styles.cardSelected
                ]}
                onPress={() => handleSelectGenre(item.id)}
                activeOpacity={0.85}
              >
                <ImageBackground
                  source={{ uri: item.imageUrl }}
                  style={styles.imageBackground}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={[styles.textOverlay, isSelected && styles.textOverlaySelected]}>
                    <Text style={styles.cardText}>{item.name}</Text>
                    {isSelected && <View style={styles.selectedDot} />}
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.footerContainer}>
          <TouchableOpacity
            onPress={handleSaveGenres}
            disabled={mutationLoading || selectedGenres.length === 0}
            style={[
              styles.btnPrimary,
              (mutationLoading || selectedGenres.length === 0) && styles.btnDisabled,
            ]}
          >
            {mutationLoading ? (
               <ActivityIndicator size="small" color="#8e44ad" />
            ) : (
               <Text style={[
                  styles.btnPrimaryText,
                  (selectedGenres.length === 0) && styles.btnTextDisabled
               ]}>
                 {selectedGenres.length > 0 ? `Guardar (${selectedGenres.length})` : 'Selecciona un género'}
               </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // El background color base ayuda a la transición
    backgroundColor: '#4facfe',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  
  // Lista
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Espacio para el botón flotante
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: 120,
    margin: 6,
    borderRadius: 16,
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    // Borde transparente por defecto
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.1)', // Fondo mientras carga imagen
  },
  cardSelected: {
    borderColor: '#FFFFFF', // Borde blanco brillante al seleccionar
    transform: [{ scale: 1.02 }] // Pequeño zoom effect
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
    overflow: 'hidden',
  },
  textOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textOverlaySelected: {
    backgroundColor: 'rgba(142, 68, 173, 0.8)', // Un tono morado semitransparente al seleccionar
  },
  cardText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  // Footer / Botón
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    // Un degradado sutil de abajo hacia arriba para que el botón resalte sobre la lista
    backgroundColor: 'transparent', 
  },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    elevation: 0,
  },
  btnPrimaryText: {
    color: '#8e44ad', // Morado oscuro
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnTextDisabled: {
    color: '#rgba(142, 68, 173, 0.5)',
  },

  // Botón reintentar (Error state)
  retryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GenerosScreen;