import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../config/colors';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = 'sk-fa0535d709fe43c7bac0e2116a4f04c9';
const BACKEND_URL = 'http://10.0.2.2:3001/takeabrakemovil/graphql';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola! ¿En qué puedo ayudarte hoy?', sender: 'bot', timestamp: new Date().getTime() },
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
      sender: 'user',
      timestamp: new Date().getTime()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      await saveToBackend(userMessage);
      const botResponse = await getBotResponse(inputText);
      
      const botMessage = {
        id: Math.random().toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().getTime()
      };

      setMessages(prev => [...prev, botMessage]);
      await saveToBackend(botMessage);

    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'Ocurrió un problema al procesar el mensaje.');
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const getBotResponse = async (userInput) => {
    try {
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
              content: userInput
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        })
      });

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || 'No se obtuvo respuesta.';
    } catch (error) {
      console.error('Error al obtener respuesta del bot:', error);
      return 'Lo siento, ocurrió un error al procesar tu mensaje.';
    }
  };

  const saveToBackend = async (message) => {
    try {
      const query = `
        mutation GuardarMensaje($input: ChatbotMovilInput!) {
          guardarMensajesChat(input: $input) {
            id
            mensaje {
              rol
              texto
            }
          }
        }
      `;

      const variables = {
        input: {
          mensaje: {
            rol: message.sender,
            texto: message.text
          }
        }
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables })
      });

      const resData = await response.json();
      
      if (resData.errors) {
        console.error('Errores GraphQL:', resData.errors);
        throw new Error(resData.errors[0].message || 'Error al guardar el mensaje');
      }

      if (!resData.data?.guardarMensajesChat) {
        throw new Error('Respuesta inesperada del servidor');
      }

      return resData.data.guardarMensajesChat;
    } catch (error) {
      console.error('Error en saveToBackend:', error);
      throw error;
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
    <SafeAreaView style={styles.container}>
      <View style={styles.oval1} />
      <View style={styles.oval2} />
      <View style={styles.oval3} />
      
      <View style={styles.header}>
        <Image source={{ uri: 'https://placehold.co/40x40/007bff/white?text=TB' }} style={styles.avatar} />
        <Text style={styles.headerTitle}>Take a Brake</Text>
        <View style={styles.headerStatus}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>En línea</Text>
        </View>
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#c38aea',
    padding: 15,
    flexDirection: 'row',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
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