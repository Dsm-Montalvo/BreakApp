// ChatScreen.js (ajuste final: input pegado abajo sin teclado y sobre el teclado cuando aparece)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLASK_API_URL = 'http://10.0.2.2:5000/chat';
const BACKEND_URL = 'http://10.0.2.2:3001/takeabrakemovil/graphql';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [conversationsList, setConversationsList] = useState([]);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    loadConversationsHistory();
  }, []);

  useEffect(() => {
    const sh = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hd = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { sh.remove(); hd.remove(); };
  }, []);

  const loadConversationsHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const query = `
        query {
          obtenerChatPorUsuario {
            id
            mensaje { rol texto fecha }
            fecha
          }
        }
      `;

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query })
      });

      const resData = await response.json();
      if (resData.data?.obtenerChatPorUsuario) {
        setConversationsList(resData.data.obtenerChatPorUsuario);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([
      { id: '1', text: '¡Hola! ¿En qué puedo ayudarte hoy?', isUser: false, sender: 'bot', timestamp: Date.now(), emotion: 'neutral' }
    ]);
    setCurrentConversationId(null);
    setIsNewConversation(true);
    setShowConversationsModal(false);
  };

  const loadConversation = (conversation) => {
    const formattedMessages = conversation.mensaje.map((msg, index) => ({
      id: `${conversation.id}-${index}`,
      text: msg.texto,
      isUser: msg.rol === 'user',
      sender: msg.rol,
      timestamp: new Date(msg.fecha).getTime(),
      emotion: msg.emotion || 'neutral'
    }));
    setMessages(formattedMessages);
    setCurrentConversationId(conversation.id);
    setIsNewConversation(false);
    setShowConversationsModal(false);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);

    const userMessage = { id: Math.random().toString(), text: inputText, isUser: true, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(FLASK_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: inputText }) });
      const data = await response.json();

      const botMessage = { id: Math.random().toString(), text: data.respuesta_generada, isUser: false, sender: 'bot', timestamp: Date.now(), emotion: data.emocion_detectada };
      setMessages(prev => [...prev, botMessage]);

      const saveSuccess = await saveToBackend([userMessage, botMessage]);
      if (!saveSuccess) {
        Alert.alert('Error', 'No se pudo guardar la conversación');
        setMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== botMessage.id));
      } else if (isNewConversation) {
        setIsNewConversation(false);
      }
    } catch (error) {
      console.error('Error en sendMessage:', error);
      Alert.alert('Error', 'Ocurrió un problema al enviar el mensaje');
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const saveToBackend = async (newMessages) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;

      const mensajesParaBackend = newMessages.map(msg => ({ rol: msg.sender, texto: msg.text, emotion: msg.emotion || 'neutral' }));

      const query = `
        mutation GuardarMensaje($input: ChatbotMovilInput!, $conversationId: ID) {
          guardarMensajesChat(input: $input, conversationId: $conversationId) {
            id
            mensaje { rol texto emotion }
          }
        }
      `;

      const variables = { input: { mensaje: mensajesParaBackend }, conversationId: isNewConversation ? null : currentConversationId };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query, variables })
      });

      const responseData = await response.json();
      if (responseData.errors) return false;
      if (responseData.data?.guardarMensajesChat?.id) {
        if (isNewConversation) setCurrentConversationId(responseData.data.guardarMensajesChat.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en saveToBackend:', error);
      return false;
    }
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.oval1} />
          <View style={styles.oval2} />
          <View style={styles.oval3} />

          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Take a Brake</Text>
              <View style={styles.headerStatus}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>En línea</Text>
              </View>
            </View>
            <TouchableOpacity onPress={startNewConversation} style={styles.newChatButton}>
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
                {item.emotion && item.sender === 'user' && (
                  <Text style={styles.emotionText}>Emoción detectada: {item.emotion}</Text>
                )}
                <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>{item.text}</Text>
                <Text style={[styles.messageTime, item.sender === 'user' ? styles.userMessageTime : styles.botMessageTime]}>{formatTime(item.timestamp)}</Text>
              </View>
            )}
            contentContainerStyle={styles.chatContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* 👉 KeyboardAvoidingView SOLO alrededor del input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <View style={[styles.inputContainer, !keyboardVisible && styles.inputContainerAtBottom]}>
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
                {isSending ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="send" size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal (sin cambios funcionales) */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showConversationsModal}
        onRequestClose={() => setShowConversationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tus conversaciones</Text>
            <TouchableOpacity onPress={() => setShowConversationsModal(false)} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {/* ... Tu lista de conversaciones ... */}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: '#63adf1ff', padding: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20, zIndex: 1, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  headerTitleContainer: { alignItems: 'center', flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  headerStatus: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 5 },
  statusText: { color: '#fff', fontSize: 12 },
  newChatButton: { padding: 5 },

  chatContainer: { padding: 16, paddingBottom: 8 },

  messageContainer: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 12 },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 0, elevation: 2 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#c38aea', borderBottomRightRadius: 0, elevation: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },
  botMessageText: { color: '#333' },
  userMessageText: { color: '#fff' },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  botMessageTime: { color: '#666' },
  userMessageTime: { color: 'rgba(255,255,255,0.7)' },
  emotionText: { fontSize: 12, fontStyle: 'italic', marginBottom: 5, color: '#fff', textAlign: 'right' },

  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  // cuando el teclado está oculto, pegamos el input al borde inferior sin gap adicional
  inputContainerAtBottom: {
    paddingBottom: 1000, // se siente más natural que 0 por el borde redondeado
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: { backgroundColor: '#c38aea', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#c38aea80' },

  oval1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#78C9DC', top: -40, left: -40, zIndex: 0, opacity: 0.3 },
  oval2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#DA96BB', bottom: -30, left: -50, zIndex: 0, opacity: 0.3 },
  oval3: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: '#4449D8', bottom: -20, right: -30, zIndex: 0, opacity: 0.3 },

  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: Platform.OS === 'ios' ? 40 : 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 5 },
});

export default ChatScreen;
