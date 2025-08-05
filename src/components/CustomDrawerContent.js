import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, gql } from '@apollo/client';
import { DrawerItemList } from '@react-navigation/drawer';

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
  const { loading, error, data, refetch } = useQuery(OBTENER_CHATS);
  const [expanded, setExpanded] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  const toggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      setSelectedChat(null); // Resetear chat seleccionado al colapsar
    }
  };

  const navigateToChat = (chatId) => {
    props.navigation.navigate('Chat', { 
      screen: 'ChatHistorial',
      params: { chatId }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.chatItem,
        selectedChat === item.id && styles.selectedChatItem
      ]}
      onPress={() => setSelectedChat(selectedChat === item.id ? null : item.id)}
    >
      <View style={styles.chatHeader}>
        <Text style={styles.chatDate}>{formatDate(item.fecha)}</Text>
        <TouchableOpacity
          onPress={() => navigateToChat(item.id)}
          style={styles.openChatButton}
        >
          <Icon name="open-in-new" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {selectedChat === item.id && (
        <View style={styles.fullChatContainer}>
          <ScrollView style={styles.chatMessagesContainer}>
            {item.mensaje.map((msg, index) => (
              <View 
                key={`${item.id}_${index}`}
                style={[
                  styles.messageBubble,
                  msg.rol === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.rol === 'user' ? styles.userMessageText : styles.botMessageText
                ]}>
                  {msg.texto}
                </Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menú</Text>
      </View>

      <DrawerItemList {...props} />

      {/* Sección de Historial de Chats */}
      <TouchableOpacity onPress={toggleExpand} style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historial de Chats</Text>
        <Icon 
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.historyContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : error ? (
            <Text style={styles.errorText}>Error al cargar historial</Text>
          ) : data?.obtenerChatPorUsuario?.length === 0 ? (
            <Text style={styles.emptyText}>No hay chats históricos</Text>
          ) : (
            <FlatList
              data={data?.obtenerChatPorUsuario || []}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
              contentContainerStyle={styles.chatListContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c38aea',
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
  },
  openChatButton: {
    padding: 5,
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
});

export default CustomDrawerContent;