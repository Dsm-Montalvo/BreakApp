import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OBTENER_CHAT_POR_ID = gql`
  query obtenerChatPorId($id: ID!) {
    obtenerChatPorId(id: $id) {
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

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'sk-fa0535d709fe43c7bac0e2116a4f04c9';
const BACKEND_URL = 'http://10.0.2.2:3001/takeabrakemovil/graphql';

const ChatHistorialScreen = ({ route, navigation, messages, setMessages, currentChatId, setCurrentChatId }) => {
  const { chatId } = route.params || {};
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { loading, error, data } = useQuery(OBTENER_CHAT_POR_ID, {
    variables: { id: chatId || currentChatId },
    skip: !chatId && !currentChatId
  });

  // Cargar mensajes desde el historial o usar los actuales
  useEffect(() => {
    if ((chatId || currentChatId) && data) {
      const historialMessages = data.obtenerChatPorId.mensaje.map(msg => ({
        id: Math.random().toString(),
        text: msg.texto,
        isUser: msg.rol === 'user',
        sender: msg.rol,
        timestamp: new Date(msg.fecha).getTime()
      }));
      
      setMessages(historialMessages);
      setCurrentChatId(chatId || currentChatId);
    }
  }, [chatId, currentChatId, data]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const userMessage = {
      id: Math.random().toString(),
      text: inputText,
      isUser: true,
      sender: 'user',
      timestamp: new Date().getTime()
    };

    // Actualiza los mensajes
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente que recomienda libros, música o películas según el estado emocional del usuario.'
          },
          ...updatedMessages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseData = await response.json();
      const botContent = responseData.choices[0].message.content;

      const botMessage = {
        id: Math.random().toString(),
        text: botContent,
        isUser: false,
        sender: 'bot',
        timestamp: new Date().getTime()
      };

      // Actualizar mensajes con la respuesta
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Guardar en el backend
      await saveToBackend(userMessage, currentChatId || chatId);
      await saveToBackend(botMessage, currentChatId || chatId);

    } catch (err) {
      console.error('Error en sendMessage:', err);
      const errorMessage = {
        id: Math.random().toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
        isUser: false,
        sender: 'bot',
        timestamp: new Date().getTime()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const saveToBackend = async (message, chatId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No hay token de autenticación');
        return;
      }

      const query = `
        mutation GuardarMensaje($input: ChatbotMovilInput!, $conversationId: ID) {
          guardarMensajesChat(input: $input, conversationId: $conversationId) {
            id
          }
        }
      `;

      const variables = {
        input: {
          mensaje: [{
            rol: message.sender === 'user' ? 'user' : 'bot',
            texto: message.text
          }]
        },
        conversationId: chatId || null
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const resData = await response.json();
      if (resData.errors) console.log('Errores en GraphQL:', resData.errors);

      // Si es un nuevo chat, guardamos el ID
      if (resData.data?.guardarMensajesChat?.id && !currentChatId) {
        setCurrentChatId(resData.data.guardarMensajesChat.id);
      }

    } catch (error) {
      console.error('Error al guardar mensaje:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer, 
            item.isUser ? styles.userMessage : styles.botMessage
          ]}>
            <Text style={[
              styles.messageText,
              item.isUser ? styles.userMessageText : styles.botMessageText
            ]}>
              {item.text}
            </Text>
            <Text style={styles.messageTime}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#63adf1ff"
          multiline
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
          editable={!isSending}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, (isSending || !inputText.trim()) && styles.disabledButton]}
          disabled={isSending || !inputText.trim()}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Los estilos permanecen igual
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a90f0ff',
    borderBottomRightRadius: 0,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1a90f0ff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#c38aea80',
  },
});

export default ChatHistorialScreen;