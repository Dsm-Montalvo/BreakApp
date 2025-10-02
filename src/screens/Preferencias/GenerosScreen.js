// GenerosScreen.jsx
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
} from 'react-native';
import { colors } from '../../config/colors';
import { gql, useMutation, useQuery } from '@apollo/client';

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

const GenerosScreen = ({ navigation }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);

  const { data, loading, error, refetch } = useQuery(LISTAR_SPOTIFY_GENEROS, {
    variables: { limit: 40, locale: undefined }, // si quieres 'es_MX' ponlo aquí
    fetchPolicy: 'cache-first',
  });

  const [actualizarPreferencias, { loading: mutationLoading }] = useMutation(ACTUALIZAR_PREFERENCIAS);

  const genres = useMemo(() => (data?.listarSpotifyGeneros ?? []), [data]);

  const handleSelectGenre = (genreId) => {
    setSelectedGenres(prev => (
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    ));
  };

  const handleSaveGenres = async () => {
    if (selectedGenres.length < 1) {
      Alert.alert('Atención', 'Por favor, selecciona al menos un género.');
      return;
    }
    try {
      await actualizarPreferencias({ variables: { input: { generos: selectedGenres } } });
      Alert.alert('Éxito', '¡Tus géneros preferidos han sido guardados!');
      // navigation.goBack(); // si quieres regresar
    } catch (e) {
      console.error('Error al guardar los géneros:', e.message);
      Alert.alert('Error', 'No se pudieron guardar tus preferencias. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={{ color: 'white', marginTop: 10 }}>Cargando géneros...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'white' }}>Error: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={[styles.customButton, { marginTop: 12 }]}>
          <Text style={styles.customButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View className="absolute" style={styles.oval1} />
      <View className="absolute" style={styles.oval2} />
      <View className="absolute" style={styles.oval3} />

      <Text style={styles.title}>Selecciona tus Géneros</Text>
      
      <FlatList
        data={genres}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => {
          const isSelected = selectedGenres.includes(item.id);
          return (
            <TouchableOpacity 
              style={[styles.cardContainer, isSelected && styles.cardSelected]}
              onPress={() => handleSelectGenre(item.id)}
              activeOpacity={0.85}
            >
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 15 }}
              >
                <View style={styles.textOverlay}>
                  {isSelected && <View style={styles.selectedIndicator} />}
                  <Text style={styles.cardText}>{item.name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSaveGenres}
          disabled={mutationLoading || selectedGenres.length === 0}
          style={[
            styles.customButton,
            (mutationLoading || selectedGenres.length === 0) && styles.buttonDisabled
          ]}
        >
          <Text style={styles.customButtonText}>
            {mutationLoading ? 'Guardando...' : `Guardar Preferencias (${selectedGenres.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20, textAlign: 'center' },

  cardContainer: {
    flex: 1,
    margin: 8,
    height: 120,
    borderRadius: 15,
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: '#1DB954' }, // <- corregido (antes cardSelectedr)

  buttonContainer: { position: 'absolute', bottom: 20, left: 20, right: 20 },

  customButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonDisabled: { backgroundColor: '#aab8c2' },
  customButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  imageBackground: { flex: 1, justifyContent: 'flex-end' },
  textOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.4)', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, padding: 10 },
  cardText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  selectedIndicator: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#1DB954', borderWidth: 2, borderColor: 'white' },

  oval1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#78C9DC', top: -40, left: -40, zIndex: 0 },
  oval2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#DA96BB', bottom: -30, left: -50, zIndex: 0 },
  oval3: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#4449D8', bottom: -20, right: -30, zIndex: 0 },
});

export default GenerosScreen;
