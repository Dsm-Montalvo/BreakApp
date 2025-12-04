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
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const FLASK_API_URL = 'https://app-ia-micro-central.purplebeach-c6e8a51b.centralus.azurecontainerapps.io/chat';
const BACKEND_URL = 'https://node-graphql-app.purplebeach-c6e8a51b.centralus.azurecontainerapps.io/takeabrakemovil/graphql';

const STORAGE_CONV_ID = 'currentConversationId';
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [conversationsList, setConversationsList] = useState([]);
  const [showConversationsModal, setShowConversationsModal] = useState(false);

  const convIdRef = useRef(currentConversationId);
  const isNewRef = useRef(isNewConversation);
  const savingRef = useRef(false);

  useEffect(() => { convIdRef.current = currentConversationId; }, [currentConversationId]);
  useEffect(() => { isNewRef.current = isNewConversation; }, [isNewConversation]);

  const flatListRef = useRef(null);

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

  useEffect(() => {
    const sh = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hd = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { sh.remove(); hd.remove(); };
  }, []);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

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
                <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' }} style={styles.spotifyIcon} />
                <Text style={styles.spotifySource}>{meta.provider}</Text>
              </View>
            </View>
          </>
        ) : <ActivityIndicator size="small" />}
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
        {!!clean && <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{clean}</Text>}
        {links.map((l) => <SpotifyCard key={l} url={l} />)}
      </View>
    );
  };

  const saveToBackend = async (newMessagesBatch) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;
      while (savingRef.current) await new Promise(r => setTimeout(r, 50));
      savingRef.current = true;
      const conversationIdToUse = isNewRef.current ? null : convIdRef.current;
      const mensajesParaBackend = newMessagesBatch.map(msg => ({ rol: msg.sender, texto: msg.text, emotion: msg.emotion || 'neutral' }));
      const query = `mutation GuardarMensaje($input: ChatbotMovilInput!, $conversationId: ID) { guardarMensajesChat(input: $input, conversationId: $conversationId) { id mensaje { rol texto emotion } } }`;
      const variables = { input: { mensaje: mensajesParaBackend }, conversationId: conversationIdToUse };
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
      const responseData = await response.json();
      if (responseData.errors) { savingRef.current = false; return false; }
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
      savingRef.current = false;
      return false;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    const userMessage = { id: uid(), text: inputText, isUser: true, sender: 'user', timestamp: Date.now(), emotion: 'neutral' };
    setMessages(prev => [...prev, userMessage]);
    try {
      const response = await fetch(FLASK_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto: inputText }) });
      const data = await response.json();
      const botMessage = { id: uid(), text: data?.respuesta_generada ?? '...', isUser: false, sender: 'bot', timestamp: Date.now(), emotion: data?.emocion_detectada || 'neutral' };
      setMessages(prev => [...prev, botMessage]);
      await saveToBackend([userMessage, botMessage]);
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al enviar el mensaje');
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <LinearGradient
      colors={['#4facfe', '#8e44ad']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header Transparente */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Take a Break</Text>
              <View style={styles.headerStatus}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>En línea</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowConversationsModal(true)} style={styles.iconButton}>
              <Icon name="history" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Lista de Mensajes */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
                {item.sender === 'user' && item.emotion && (
                  <Text style={styles.emotionText}>Emoción: {item.emotion}</Text>
                )}
                {renderMessageContent(item.text, item.sender === 'user')}
                <Text style={[styles.messageTime, item.sender === 'user' ? styles.userMessageTime : styles.botMessageTime]}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Flotante */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <View style={[styles.inputContainer, !keyboardVisible && styles.inputContainerAtBottom]}>
               {/* Contenedor tipo vidrio para el input */}
               <BlurView style={styles.inputBlur} blurType="light" blurAmount={10} reducedTransparencyFallbackColor="white" />
               
               <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Escribe tu mensaje..."
                  placeholderTextColor="#666"
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                  blurOnSubmit={false}
                  editable={!isSending}
               />
               <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, (isSending || !inputText.trim()) && styles.disabledButton]} disabled={isSending || !inputText.trim()}>
                  {isSending ? <ActivityIndicator size="small" color="#8e44ad" /> : <Icon name="send" size={24} color="#8e44ad" />}
               </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          {/* Modal Historial */}
          <Modal animationType="slide" transparent={false} visible={showConversationsModal} onRequestClose={() => setShowConversationsModal(false)}>
            <LinearGradient colors={['#4facfe', '#8e44ad']} style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Historial</Text>
                    <TouchableOpacity onPress={() => setShowConversationsModal(false)}>
                        <Icon name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={conversationsList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.conversationItem} onPress={() => loadConversation(item)}>
                            <Text style={styles.conversationText} numberOfLines={1}>{item.mensaje?.[0]?.texto || 'Nueva conversación'}</Text>
                            <Text style={styles.conversationDate}>{new Date(item.fecha).toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.noConversationsText}>No hay conversaciones anteriores</Text>}
                />
                <TouchableOpacity style={styles.newConversationButton} onPress={startNewConversation}>
                    <Text style={styles.newConversationButtonText}>Nueva conversación</Text>
                </TouchableOpacity>
            </LinearGradient>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4facfe' },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 50,
    paddingBottom: 10,
    // Fondo transparente o muy sutil
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#50fa7b', marginRight: 6 },
  statusText: { color: '#eee', fontSize: 12 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },

  // Chat
  chatContainer: { paddingHorizontal: 15, paddingBottom: 20, paddingTop: 10 },
  messageContainer: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  // Bot: Blanco
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderBottomLeftRadius: 4 },
  botMessageText: { color: '#333' },
  botMessageTime: { color: '#888' },
  // User: Morado sutil/Vidrio oscuro o sólido para contraste
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#7d3eb8', borderBottomRightRadius: 4 }, // Morado que combina con el gradiente
  userMessageText: { color: '#fff' },
  userMessageTime: { color: 'rgba(255,255,255,0.7)' },
  
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  emotionText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 2, fontStyle: 'italic', textAlign: 'right' },

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 30,
    overflow: 'hidden', // para el blur
    height: 60,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  inputBlur: {
    position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.8)', // Fondo casi blanco
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    color: '#333',
    fontSize: 16,
  },
  sendButton: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Spotify
  spotifyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 8, marginTop: 6 },
  spotifyImage: { width: 50, height: 50, borderRadius: 8, marginRight: 8 },
  spotifyTitle: { fontSize: 14, fontWeight: 'bold', color: '#000', flex: 1 },
  spotifyFooter: { flexDirection: 'row', alignItems: 'center' },
  spotifyIcon: { width: 14, height: 14, tintColor: '#1DB954', marginRight: 4 },
  spotifySource: { fontSize: 11, color: '#1DB954' },

  // Modal
  modalContainer: { flex: 1, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  conversationItem: { padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  conversationText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  conversationDate: { fontSize: 12, color: '#ddd', marginTop: 4 },
  noConversationsText: { textAlign: 'center', color: '#eee', marginTop: 20 },
  newConversationButton: { backgroundColor: '#fff', borderRadius: 30, padding: 15, marginTop: 20, alignItems: 'center' },
  newConversationButtonText: { color: '#8e44ad', fontSize: 16, fontWeight: 'bold' }
});

export default ChatScreen;