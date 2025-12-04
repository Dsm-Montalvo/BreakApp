import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, gql } from '@apollo/client';
import { DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';

const OBTENER_CHATS = gql`
  query obtenerChatPorUsuario {
    obtenerChatPorUsuario {
      id
      mensaje {
        rol
        texto
        fecha
      }
      fecha
    }
  }
`;

const CustomDrawerContent = (props) => {
  const { loading, error, data, refetch } = useQuery(OBTENER_CHATS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const [expanded, setExpanded] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔁 Actualizar al volver a la vista
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // 🔃 Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error al refrescar historial:', error);
    }
    setRefreshing(false);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) setSelectedChat(null);
  };

  const navigateToChat = (chatId) => {
    props.navigation.navigate('Chat', {
      screen: 'ChatHistorial',
      params: { chatId },
    });
  };

  const getFirstUserMessage = (mensajes) => {
    const primerMensaje = mensajes.find((msg) => msg.rol === 'user');
    if (!primerMensaje) return 'Sin mensaje';
    return primerMensaje.texto.length > 40
      ? primerMensaje.texto.substring(0, 40) + '...'
      : primerMensaje.texto;
  };

  const renderChatItem = ({ item }) => {
    const firstMessage = getFirstUserMessage(item.mensaje);

    const handlePress = () => {
      if (selectedChat === item.id) {
        // 👉 Segunda vez que lo presiona → ir al chat completo
        navigateToChat(item.id);
      } else {
        // 👉 Primera vez que lo presiona → expandir vista previa
        setSelectedChat(item.id);
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          selectedChat === item.id && styles.selectedChatItem,
        ]}
        onPress={handlePress}
      >
        {/* Encabezado del chat */}
        <View style={styles.chatHeader}>
          <Text style={styles.chatDate}>{firstMessage}</Text>
          <Text style={styles.chatTime}>
            {new Date(item.fecha).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            })}
          </Text>
        </View>

        {/* Vista previa expandida */}
        {selectedChat === item.id && (
          <View style={styles.fullChatContainer}>
            <ScrollView style={styles.chatMessagesContainer}>
              {item.mensaje.slice(0, 3).map((msg, index) => (
                <View
                  key={`${item.id}_${index}`}
                  style={[
                    styles.messageBubble,
                    msg.rol === 'user'
                      ? styles.userMessage
                      : styles.botMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.rol === 'user'
                        ? styles.userMessageText
                        : styles.botMessageText,
                    ]}
                  >
                    {msg.texto}
                  </Text>
                  {msg.fecha && (
                    <Text style={styles.messageTime}>
                      {new Date(msg.fecha).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 🧮 Orden descendente (más recientes arriba)
  const sortedChats = data?.obtenerChatPorUsuario
    ? [...data.obtenerChatPorUsuario].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      )
    : [];

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menú</Text>
      </View>

      <DrawerItemList {...props} />

      {/* Sección Historial */}
      <TouchableOpacity onPress={toggleExpand} style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historial de Chats</Text>
        <Icon
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Contenedor del historial */}
      {expanded && (
        <View style={styles.historyContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : error ? (
            <Text style={styles.errorText}>Error al cargar historial</Text>
          ) : sortedChats.length === 0 ? (
            <Text style={styles.emptyText}>No hay chats históricos</Text>
          ) : (
            <FlatList
              data={sortedChats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              contentContainerStyle={styles.chatListContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#fff']}
                  tintColor="#fff"
                />
              }
            />
          )}
        </View>
      )}

      {/* Línea divisoria */}
      <View style={styles.divider} />

      {/* Botón salir */}
      <View style={styles.bottomSection}>
        <DrawerItem
          label="Salir"
          labelStyle={styles.logoutLabel}
          icon={({ color, size }) => (
            <Icon name="exit-to-app" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
        />
      </View>
    </View>
  );
};

// 🎨 ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3f8fd8',
    paddingTop: 20,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  historyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatListContainer: {
    paddingBottom: 20,
  },
  chatItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  selectedChatItem: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    paddingBottom: 4,
  },
  chatTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  fullChatContainer: {
    marginTop: 10,
    maxHeight: 200,
  },
  chatMessagesContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 8,
  },
  messageBubble: {
    maxWidth: '90%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#000',
  },
  botMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: 'rgba(255,255,255,0.7)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    padding: 10,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    padding: 15,
    fontStyle: 'italic',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  bottomSection: {
    paddingBottom: 15,
  },
  logoutLabel: {
    color: '#ff5252',
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
