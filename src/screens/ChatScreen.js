import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// conexion con api 
const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'sk-fa0535d709fe43c7bac0e2116a4f04c9';
const BACKEND_URL = 'https://takeback.onrender.com/takeabrakemovil/graphql';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola! ¿En qué puedo ayudarte hoy?', isUser: false, sender: 'bot', timestamp: new Date().getTime() },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

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

    setMessages(prev => [...prev, userMessage]);

    try {
      // 1. Guardar mensaje del usuario en backend
      await saveToBackend(userMessage);

      // 2. Llamar a la API de DeepSeek
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente que recomienda libros, música o películas según el estado emocional del usuario. Solo puedes responder sobre eso.'
            },
            {
              role: 'user',
              content: inputText
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      const data = await response.json();

      const botContent = data?.choices?.[0]?.message?.content || 'No se obtuvo respuesta.';

      const botMessage = {
        id: Math.random().toString(),
        text: botContent,
        isUser: false,
        sender: 'bot',
        timestamp: new Date().getTime()
      };

      setMessages(prev => [...prev, botMessage]);

      // 3. Guardar respuesta del bot
      await saveToBackend(botMessage);

    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'Ocurrió un problema al procesar el mensaje.');
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const saveToBackend = async (message) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No hay token de autenticación');
        return;
      }

      const query = `
        mutation GuardarMensaje($input: ChatbotMovilInput!) {
          guardarMensajesChat(input: $input) {
            id
          }
        }
      `;

      const variables = {
        input: {
          mensaje: [
            {
              rol: message.sender === 'user' ? 'user' : 'bot',
              texto: message.text
            }
          ]
        }
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables })
      });

      const resData = await response.json();
      if (resData.errors) {
        console.log('Errores en GraphQL:', resData.errors);
      }
    } catch (error) {
      console.error('Error al guardar mensaje:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />
      
      {/* Cabecera del chat */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Take a Brake</Text>
        <View style={styles.headerStatus}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>En línea</Text>
        </View>
      </View>

      {/* Lista de mensajes */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
              <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
                {item.text}
              </Text>
              <Text style={[styles.messageTime, item.sender === 'user' ? styles.userMessageTime : styles.botMessageTime]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />

        {/* Área de entrada de texto */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#999"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#c38aea',
    padding: 15,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#c38aea',
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
  },
  botMessageTime: {
    color: '#666',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: '#c38aea',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#c38aea80',
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
    opacity: 0.3,
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
    opacity: 0.3,
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
    opacity: 0.3,
  },
});

export default ChatScreen;