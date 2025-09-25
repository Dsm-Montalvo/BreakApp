import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  ImageBackground,
  Button,
} from 'react-native';
import { colors } from '../../config/colors';
import { gql, useMutation } from '@apollo/client';

// --- TUS CREDENCIALES DE SPOTIFY ---
// Reemplaza esto con las credenciales que obtuviste en el Dashboard de Spotify
const SPOTIFY_CLIENT_ID = '2ac5e34d7330451d841a1274e4832167';
const SPOTIFY_CLIENT_SECRET = 'c7affad07a5546599c14345d7b53a073';


const ACTUALIZAR_PREFERENCIAS = gql`
  mutation actualizarPreferenciasUsuario($input: PreferenciasInput) {
    actualizarPreferenciasUsuario(input: $input) {
      id
      preferences {
        generos
      }
    }
  }
`;
//************************************************** **************************************************************************************************inicio de screen o navegacion
const GenerosScreen = ({ navigation }) => {
  // Estados para manejar los datos, el estado de carga y los errores
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const [actualizarPreferencias, { loading: mutationLoading, error: mutationError }] = useMutation(ACTUALIZAR_PREFERENCIAS);




  const handleSelectGenre = (genreName) => {
    setSelectedGenres(prevSelected => {
      if (prevSelected.includes(genreName)) {
        return prevSelected.filter(name => name !== genreName);
      } else {
        return [...prevSelected, genreName];
      }
    });
  };

  // ******************************************************************************************************************************************************Use efect
   useEffect(() => {
    const fetchSpotifyCategories = async () => {
      try {
        // Autenticación (sin cambios)
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', SPOTIFY_CLIENT_ID);
        params.append('client_secret', SPOTIFY_CLIENT_SECRET);

        const authResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        
        if (!authResponse.ok) throw new Error('Falló la autenticación con Spotify');
        
        const authData = await authResponse.json();
        const accessToken = authData.access_token;

        if (!accessToken) throw new Error('No se recibió un access_token de Spotify');

        // Obtener Categorías (con un pequeño cambio)
         const categoriesResponse = await fetch('https://api.spotify.com/v1/browse/categories?limit=40', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }); 
         

        if (!categoriesResponse.ok) {
          throw new Error(`Error al obtener categorías [${categoriesResponse.status}]`);
        }

        const categoriesData = await categoriesResponse.json();
        
        // --- PASO 1: CAPTURAR MÁS DATOS ---
        // Ahora guardamos un objeto con id, nombre e imagen por cada categoría.
        const categoryItems = categoriesData.categories.items.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.icons[0]?.url, // Usamos la primera imagen disponible
        }));
        
        setGenres(categoryItems);

      } catch (e) {
        setError(e.message); 
        console.error("Falló la obtención de datos:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyCategories();
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez cuando el componente se monta

  // ************************************************************************************************************************************************************logica de guardado
  // --- FUNCIÓN PARA GUARDAR EN LA BASE DE DATOS ---
  const handleSaveGenres = async () => {
    if (selectedGenres.length < 1) {
      Alert.alert('Atención', 'Por favor, selecciona al menos un género.');
      return;
    }

    // --- ¡IMPORTANTE! ---
    // Debes reemplazar esto con la lógica real para obtener el ID del usuario logueado.
    const userId = 'ID_DEL_USUARIO_LOGUEADO'; 

    try {
      await actualizarPreferencias({
        variables: {
          input: {
            idUsuario: userId,
            generos: selectedGenres
          }
        }
      });
      Alert.alert('Éxito', '¡Tus géneros preferidos han sido guardados!');
      // navigation.navigate('Home'); // Opcional: navegar a otra pantalla
    } catch (e) {
      console.error('Error al guardar los géneros:', e.message);
      Alert.alert('Error', 'No se pudieron guardar tus preferencias. Inténtalo de nuevo.');
    }
  };


  // *******************************************************************************************************************************************************************REnderdizado
  // --- Renderizado condicional ---
  // Mostramos un indicador de carga mientras se obtienen los datos.
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: 'white', marginTop: 10 }}>Cargando géneros...</Text>
      </View>
    );
  }

  // Mostramos un mensaje de error si algo falló.
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'white' }}>Error: {error}</Text>
      </View>
    );
  }
// *****************************************************************************************************************************************************************vista
  // --- Renderizado de la lista de géneros ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />

      <Text style={styles.title}>Selecciona tus Géneros</Text>
      
      <FlatList
        data={genres}
        numColumns={2} // Mostramos en dos columnas
        keyExtractor={(item) => item.id} // Usamos el ID único de la categoría
        renderItem={({ item }) => {
          // Verificamos si la tarjeta actual está en nuestro estado de selección
          const isSelected = selectedGenres.includes(item.id);

          return (
            <TouchableOpacity 
              style={[styles.cardContainer, isSelected && styles.cardSelectedr]}
              onPress={() => handleSelectGenre(item.id)}
            >
              <ImageBackground
                source={{ uri: item.imageUrl }}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 15 }} // Redondea la imagen
              >
                {/* Capa oscura para mejorar legibilidad del texto */}
                <View style={styles.textOverlay}>
                   {/* Mostramos una marca si está seleccionado */}
                  {isSelected && <View style={styles.selectedIndicator} />}
                  <Text style={styles.cardText}>{item.name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* --- BOTÓN PARA GUARDAR --- */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          // Mantenemos la misma lógica para deshabilitar y para el evento onPress
          onPress={handleSaveGenres}
          disabled={true}
          //disabled={mutationLoading || selectedGenres.length === 0}
          // Aplicamos estilos de forma condicional
          style={[
            styles.customButton, // Estilo base del botón
            (mutationLoading || selectedGenres.length === 0) && styles.buttonDisabled // Estilo extra si está deshabilitado
          ]}
        >
          <Text style={styles.customButtonText}>
            {mutationLoading ? "Guardando..." : `Guardar Preferencias (${selectedGenres.length})`}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

//*************************************************************************************************************************************************estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  center: { // Estilo para centrar el contenido de carga/error
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "white",
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
   flex: 1,
    margin: 8,
    height: 120,
    borderRadius: 15,
    backgroundColor: '#333', // Color de fondo por si la imagen no carga
    // Estilos de Sombra (Profundidad)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2, // Borde para el efecto de selección
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#1DB954', // Borde verde Spotify al seleccionar
  },

  buttonContainer: {
    // Posiciona el botón sobre la lista
    position: 'absolute',
    bottom: 20, // <-- Sube el botón un poco desde el borde del SafeArea
    left: 20,
    right: 20,
  },

   // --- NUEVOS ESTILOS PARA EL BOTÓN PERSONALIZADO ---

  // El botón azul habilitado
  customButton: {
    backgroundColor: colors.primary, // Tu color azul
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // Estilo gris para cuando esté deshabilitado
  buttonDisabled: {
    backgroundColor: '#aab8c2', // Un color gris para el estado deshabilitado
  },

  // El texto del botón
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },


  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end', // Alinea el texto al final
  },
  textOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 10,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1DB954', // Verde Spotify
    borderWidth: 2,
    borderColor: 'white',
  },
  genreItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  genreText: {
    color: 'white',
    fontSize: 16,
    textTransform: 'capitalize', // Para que la primera letra sea mayúscula
  },
  // Tus óvalos decorativos se mantienen igual
  oval1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#78C9DC',
    top: -40,
    left: -40,
    zIndex: 0,
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
  },
});

export default GenerosScreen;