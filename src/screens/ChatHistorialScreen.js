// src/screens/ChatHistorialScreen.js
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
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { colors } from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLASK_API_URL = 'http://10.0.2.2:5000/chat';
const BACKEND_URL = 'http://10.0.2.2:3001/takeabrakemovil/graphql';

const ChatHistorialScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const route = useRoute();
  const { chatId } = route.params || {};
  const flatListRef = useRef(null);

  useEffect(() => {
    if (chatId) loadSingleConversation(chatId);
    else startNewConversation();
  }, [chatId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ---- Spotify logic ----
  const SPOTIFY_TRACK_RE = /(https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+)/g;

  const extractLinks = (text) => {
    const found = text.match(SPOTIFY_TRACK_RE);
    return found ? [...new Set(found)] : [];
  };

  const fetchSpotifyMetadata = async (url) => {
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return { title: data.title, thumbnail: data.thumbnail_url, provider: data.provider_name };
    } catch {
      return null;
    }
  };

  const SpotifyCard = ({ url }) => {
    const [meta, setMeta] = useState(null);
    useEffect(() => { fetchSpotifyMetadata(url).then(setMeta); }, [url]);

    return (
      <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.spotifyCard} activeOpacity={0.9}>
        {meta ? (
          <>
            <Image source={{ uri: meta.thumbnail }} style={styles.spotifyImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.spotifyTitle} numberOfLines={2}>{meta.title}</Text>
              <View style={styles.spotifyFooter}>
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' }}
                  style={styles.spotifyIcon}
                />
                <Text style={styles.spotifySource}>{meta.provider}</Text>
              </View>
            </View>
          </>
        ) : (
          <ActivityIndicator size="small" />
        )}
      </TouchableOpacity>
    );
  };

  const renderMessageContent = (text, isUser) => {
    const links = extractLinks(text);
    if (!links.length) {
      return <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{text}</Text>;
    }

    const clean = text.replace(SPOTIFY_TRACK_RE, '').replace(/\s{2,}/g, ' ').trim();

    return (
      <View>
        {!!clean && (
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>
            {clean}
          </Text>
        )}
        {links.map((l) => <SpotifyCard key={l} url={l} />)}
      </View>
    );
  };
  // ------------------------

  const loadSingleConversation = async (chatId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const query = `
        query {
          obtenerChatPorUsuario {
            id
            mensaje { rol texto fecha emotion }
          }
        }
      `;

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const resData = await response.json();
      const conversation = resData.data?.obtenerChatPorUsuario?.find(c => c.id === chatId);
      if (conversation) {
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
      } else {
        Alert.alert('Error', 'No se encontró la conversación');
      }
    } catch (error) {
      console.error('Error al cargar conversación:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([{
      id: '1',
      text: '¡Hola! ¿En qué puedo ayudarte hoy?',
      isUser: false,
      sender: 'bot',
      timestamp: Date.now(),
      emotion: 'neutral'
    }]);
    setCurrentConversationId(null);
    setIsNewConversation(true);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);

    const userMessage = {
      id: Math.random().toString(),
      text: inputText,
      isUser: true,
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(FLASK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: inputText })
      });
      const data = await response.json();

      const botMessage = {
        id: Math.random().toString(),
        text: data.respuesta_generada,
        isUser: false,
        sender: 'bot',
        timestamp: Date.now(),
        emotion: data.emocion_detectada
      };
      setMessages(prev => [...prev, botMessage]);

      const saved = await saveToBackend([userMessage, botMessage]);
      if (!saved) {
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

      const mensajesParaBackend = newMessages.map(msg => ({
        rol: msg.sender,
        texto: msg.text,
        emotion: msg.emotion || 'neutral'
      }));

      const query = `
        mutation GuardarMensaje($input: ChatbotMovilInput!, $conversationId: ID) {
          guardarMensajesChat(input: $input, conversationId: $conversationId) {
            id
            mensaje { rol texto emotion }
          }
        }
      `;

      const variables = {
        input: { mensaje: mensajesParaBackend },
        conversationId: isNewConversation ? null : currentConversationId
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, variables })
      });

      const resData = await response.json();
      if (resData.errors) return false;

      if (resData.data?.guardarMensajesChat?.id) {
        if (isNewConversation) {
          setCurrentConversationId(resData.data.guardarMensajesChat.id);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en saveToBackend:', error);
      return false;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
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

          {/* Chat */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.messageContainer,
                item.sender === 'user' ? styles.userMessage : styles.botMessage
              ]}>
                {item.emotion && item.sender === 'user' && (
                  <Text style={styles.emotionText}>Emoción detectada: {item.emotion}</Text>
                )}
                {renderMessageContent(item.text, item.sender === 'user')}
                <Text style={[
                  styles.messageTime,
                  item.sender === 'user' ? styles.userMessageTime : styles.botMessageTime
                ]}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.chatContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* Input */}
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
              {isSending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Icon name="send" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// ===== Estilos =====
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#63adf1ff',
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitleContainer: { alignItems: 'center', flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  headerStatus: { flexDirection: 'row', alignItems: 'center' },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginRight: 5 },
  statusText: { color: '#fff', fontSize: 12 },
  newChatButton: { padding: 5 },

  chatContainer: { padding: 16, paddingBottom: 100 },
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
    alignItems: 'flex-end',
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
  sendButton: {
    backgroundColor: '#c38aea',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#c38aea80' },

  // Tarjetas Spotify
  spotifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f8f3',
    borderRadius: 12,
    padding: 8,
    marginTop: 6
  },
  spotifyImage: { width: 56, height: 56, borderRadius: 8, marginRight: 8 },
  spotifyTitle: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  spotifyFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  spotifyIcon: { width: 16, height: 16, tintColor: '#1DB954', marginRight: 4 },
  spotifySource: { fontSize: 12, color: '#1DB954' },
});

export default ChatHistorialScreen;
