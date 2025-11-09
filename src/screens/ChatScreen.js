// src/screens/ChatScreen.js
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
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLASK_API_URL = 'http://10.0.2.2:5000/chat';
const BACKEND_URL = 'http://10.0.2.2:3001/takeabrakemovil/graphql';

const STORAGE_CONV_ID = 'currentConversationId';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ChatScreen = () => {
  // ---- Estado principal: UN SOLO ARREGLO ----
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // UI
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Conversaciones / historial
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [conversationsList, setConversationsList] = useState([]);
  const [showConversationsModal, setShowConversationsModal] = useState(false);

  // Refs para evitar race conditions
  const convIdRef = useRef(currentConversationId);
  const isNewRef = useRef(isNewConversation);
  const savingRef = useRef(false); // mutex de guardado

  useEffect(() => { convIdRef.current = currentConversationId; }, [currentConversationId]);
  useEffect(() => { isNewRef.current = isNewConversation; }, [isNewConversation]);

  const flatListRef = useRef(null);

  // Cargar convId guardado y el historial
  useEffect(() => {
    const init = async () => {
      try {
        const storedConvId = await AsyncStorage.getItem(STORAGE_CONV_ID);
        if (storedConvId) {
          setCurrentConversationId(storedConvId);
          convIdRef.current = storedConvId;
          setIsNewConversation(false);
          isNewRef.current = false;
        }
      } catch (e) {
        console.log('No se pudo leer el convId almacenado', e);
      }
      loadConversationsHistory();
    };
    init();
  }, []);

  // Listeners del teclado (para pegar input abajo / encima del teclado)
  useEffect(() => {
    const sh = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hd = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { sh.remove(); hd.remove(); };
  }, []);

  // Autoscroll al final
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  // ---- Historial desde backend ----
  const loadConversationsHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const query = `
        query {
          obtenerChatPorUsuario {
            id
            mensaje { rol texto fecha emotion }
            fecha
          }
        }
      `;

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  // ---- Nueva conversación (reinicia array e ID local) ----
  const startNewConversation = async () => {
    const greeting = {
      id: uid(),
      text: '¡Hola! ¿En qué puedo ayudarte hoy?',
      isUser: false,
      sender: 'bot',
      timestamp: Date.now(),
      emotion: 'neutral'
    };
    setMessages([greeting]);
    setCurrentConversationId(null);
    convIdRef.current = null;
    setIsNewConversation(true);
    isNewRef.current = true;
    await AsyncStorage.removeItem(STORAGE_CONV_ID);
    setShowConversationsModal(false);
  };

  // ---- Cargar conversación del historial (continúa en MISMO array en backend) ----
  const loadConversation = async (conversation) => {
    const formatted = conversation.mensaje.map((msg, index) => ({
      id: `${conversation.id}-${index}`,
      text: msg.texto,
      isUser: msg.rol === 'user',
      sender: msg.rol,
      timestamp: msg.fecha ? new Date(msg.fecha).getTime() : Date.now(),
      emotion: msg.emotion || 'neutral'
    }));
    setMessages(formatted);
    setCurrentConversationId(conversation.id);
    convIdRef.current = conversation.id;
    setIsNewConversation(false);
    isNewRef.current = false;
    await AsyncStorage.setItem(STORAGE_CONV_ID, conversation.id);
    setShowConversationsModal(false);
  };

  // ===================== Tarjetas de Spotify =====================
  // Solo tracks para evitar duplicados/ruido; fácilmente puedes ampliar a /album|/playlist si quieres.
  const SPOTIFY_TRACK_RE = /(https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+)/g;

  const extractLinks = (text) => {
    const found = text.match(SPOTIFY_TRACK_RE);
    return found ? [...new Set(found)] : []; // sin duplicados
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

  // Render de texto + tarjetas sin repetir links y sin pegarlos dos veces
  const renderMessageContent = (text, isUser) => {
    const links = extractLinks(text);
    if (!links.length) {
      return <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{text}</Text>;
    }

    // limpiamos los links del texto para que no salgan duplicados
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
  // ===============================================================

  // ---- Guardar SIEMPRE en el MISMO array (misma conversación) ----
  const saveToBackend = async (newMessagesBatch) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;

      // Mutex: evita dos guardados simultáneos
      while (savingRef.current) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 50));
      }
      savingRef.current = true;

      const conversationIdToUse = isNewRef.current ? null : convIdRef.current;

      const mensajesParaBackend = newMessagesBatch.map(msg => ({
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
        conversationId: conversationIdToUse
      };

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query, variables })
      });

      const responseData = await response.json();

      if (responseData.errors) {
        console.error('Errores GraphQL:', responseData.errors);
        savingRef.current = false;
        return false;
      }

      const returnedId = responseData.data?.guardarMensajesChat?.id;
      if (returnedId) {
        if (!convIdRef.current) {
          setCurrentConversationId(returnedId);
          convIdRef.current = returnedId;
          await AsyncStorage.setItem(STORAGE_CONV_ID, returnedId);
        }
        setIsNewConversation(false);
        isNewRef.current = false;
        savingRef.current = false;
        return true;
      }

      savingRef.current = false;
      return !!convIdRef.current;
    } catch (error) {
      console.error('Error en saveToBackend:', error);
      savingRef.current = false;
      return false;
    }
  };

  // ---- Enviar mensaje (mismo arreglo, misma conversación) ----
  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);

    const userMessage = {
      id: uid(),
      text: inputText,
      isUser: true,
      sender: 'user',
      timestamp: Date.now(),
      emotion: 'neutral'
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
        id: uid(),
        text: data?.respuesta_generada ?? '...',
        isUser: false,
        sender: 'bot',
        timestamp: Date.now(),
        emotion: data?.emocion_detectada || 'neutral'
      };

      setMessages(prev => [...prev, botMessage]);

      const ok = await saveToBackend([userMessage, botMessage]);
      if (!ok) {
        Alert.alert('Error', 'No se pudo guardar la conversación en el servidor.');
      }
    } catch (error) {
      console.error('Error en sendMessage:', error);
      Alert.alert('Error', 'Ocurrió un problema al enviar el mensaje');
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
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
            {/* Abrir historial */}
            <TouchableOpacity onPress={() => setShowConversationsModal(true)} style={styles.newChatButton}>
              <Icon name="history" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Mensajes */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.messageContainer,
                item.sender === 'user' ? styles.userMessage : styles.botMessage
              ]}>
                {/* Mostrar emoción (si quieres, solo para user como en tu versión) */}
                {item.sender === 'user' && item.emotion && (
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
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          {/* Input pegado abajo / arriba del teclado */}
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
                returnKeyType="send"
                onSubmitEditing={sendMessage}
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

          {/* Modal: Historial */}
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

              <FlatList
                data={conversationsList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.conversationItem}
                    onPress={() => loadConversation(item)}
                  >
                    <Text style={styles.conversationText} numberOfLines={1}>
                      {item.mensaje?.[0]?.texto || 'Nueva conversación'}
                    </Text>
                    <Text style={styles.conversationDate}>
                      {new Date(item.fecha).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noConversationsText}>No hay conversaciones anteriores</Text>
                }
              />

              <TouchableOpacity style={styles.newConversationButton} onPress={startNewConversation}>
                <Text style={styles.newConversationButtonText}>Nueva conversación</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: '#63adf1ff',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5
  },
  headerTitleContainer: { alignItems: 'center', flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
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
  inputContainerAtBottom: {
    paddingBottom: 10,
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
    maxHeight: 120,
  },
  sendButton: { backgroundColor: '#c38aea', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#c38aea80' },

  // Tarjeta Spotify
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

  // Modal historial
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: Platform.OS === 'ios' ? 40 : 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 5 },
  conversationItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  conversationText: { fontSize: 16, color: '#333' },
  conversationDate: { fontSize: 12, color: '#666', marginTop: 5 },
  noConversationsText: { textAlign: 'center', marginTop: 20, color: '#666' },
  newConversationButton: { backgroundColor: '#c38aea', borderRadius: 25, padding: 15, margin: 20, alignItems: 'center' },
  newConversationButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ChatScreen;
