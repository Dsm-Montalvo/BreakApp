import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard, TouchableWithoutFeedback, Linking, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const FLASK_API_URL = 'https://app-ia-micro-central.purplebeach-c6e8a51b.centralus.azurecontainerapps.io/chat';
const BACKEND_URL = 'https://node-graphql-app.purplebeach-c6e8a51b.centralus.azurecontainerapps.io/takeabrakemovil/graphql';

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
    } catch { return null; }
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
    if (!links.length) return <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{text}</Text>;
    const clean = text.replace(SPOTIFY_TRACK_RE, '').replace(/\s{2,}/g, ' ').trim();
    return (
      <View>
        {!!clean && <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.botMessageText]}>{clean}</Text>}
        {links.map((l) => <SpotifyCard key={l} url={l} />)}
      </View>
    );
  };

  const loadSingleConversation = async (chatId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const query = `query { obtenerChatPorUsuario { id mensaje { rol texto fecha emotion } } }`;
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ query }) });
      const resData = await response.json();
      const conversation = resData.data?.obtenerChatPorUsuario?.find(c => c.id === chatId);
      if (conversation) {
        const formattedMessages = conversation.mensaje.map((msg, index) => ({ id: `${conversation.id}-${index}`, text: msg.texto, isUser: msg.rol === 'user', sender: msg.rol, timestamp: new Date(msg.fecha).getTime(), emotion: msg.emotion || 'neutral' }));
        setMessages(formattedMessages);
        setCurrentConversationId(conversation.id);
        setIsNewConversation(false);
      } else { Alert.alert('Error', 'No se encontró la conversación'); }
    } catch (error) { console.error('Error al cargar conversación:', error); }
  };

  const startNewConversation = () => {
    setMessages([{ id: '1', text: '¡Hola! ¿En qué puedo ayudarte hoy?', isUser: false, sender: 'bot', timestamp: Date.now(), emotion: 'neutral' }]);
    setCurrentConversationId(null);
    setIsNewConversation(true);
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
      const saved = await saveToBackend([userMessage, botMessage]);
      if (saved && isNewConversation) setIsNewConversation(false);
    } catch (error) { Alert.alert('Error', 'Ocurrió un problema al enviar el mensaje'); }
    finally { setInputText(''); setIsSending(false); }
  };

  const saveToBackend = async (newMessages) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;
      const mensajesParaBackend = newMessages.map(msg => ({ rol: msg.sender, texto: msg.text, emotion: msg.emotion || 'neutral' }));
      const query = `mutation GuardarMensaje($input: ChatbotMovilInput!, $conversationId: ID) { guardarMensajesChat(input: $input, conversationId: $conversationId) { id mensaje { rol texto emotion } } }`;
      const variables = { input: { mensaje: mensajesParaBackend }, conversationId: isNewConversation ? null : currentConversationId };
      const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ query, variables }) });
      const resData = await response.json();
      if (resData.data?.guardarMensajesChat?.id) {
        if (isNewConversation) setCurrentConversationId(resData.data.guardarMensajesChat.id);
        return true;
      }
      return false;
    } catch (error) { return false; }
  };

  const formatTime = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <LinearGradient colors={['#4facfe', '#8e44ad']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Take a Break</Text>
                <View style={styles.headerStatus}>
                  <View style={styles.statusIndicator} />
                  <Text style={styles.statusText}>En línea</Text>
                </View>
              </View>
              <TouchableOpacity onPress={startNewConversation} style={styles.iconButton}>
                <Icon name="add" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Chat */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
                  {item.emotion && item.sender === 'user' && <Text style={styles.emotionText}>Emoción: {item.emotion}</Text>}
                  {renderMessageContent(item.text, item.sender === 'user')}
                  <Text style={[styles.messageTime, item.sender === 'user' ? styles.userMessageTime : styles.botMessageTime]}>{formatTime(item.timestamp)}</Text>
                </View>
              )}
              contentContainerStyle={styles.chatContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />

            {/* Input Flotante */}
            <View style={[styles.inputContainer, !keyboardVisible && styles.inputContainerAtBottom]}>
               <BlurView style={styles.inputBlur} blurType="light" blurAmount={10} reducedTransparencyFallbackColor="white" />
               <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Escribe tu mensaje..."
                  placeholderTextColor="#666"
                  multiline
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  editable={!isSending}
               />
               <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, (isSending || !inputText.trim()) && styles.disabledButton]} disabled={isSending || !inputText.trim()}>
                  {isSending ? <ActivityIndicator size="small" color="#8e44ad" /> : <Icon name="send" size={24} color="#8e44ad" />}
               </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4facfe' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 50, paddingBottom: 10 },
  headerTitleContainer: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#50fa7b', marginRight: 6 },
  statusText: { color: '#eee', fontSize: 12 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },

  chatContainer: { paddingHorizontal: 15, paddingBottom: 20, paddingTop: 10 },
  messageContainer: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderBottomLeftRadius: 4 },
  botMessageText: { color: '#333' },
  botMessageTime: { color: '#888' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#7d3eb8', borderBottomRightRadius: 4 },
  userMessageText: { color: '#fff' },
  userMessageTime: { color: 'rgba(255,255,255,0.7)' },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  emotionText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 2, fontStyle: 'italic', textAlign: 'right' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 15, borderRadius: 30, overflow: 'hidden', height: 60, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  inputBlur: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.8)' },
  input: { flex: 1, height: '100%', paddingHorizontal: 20, color: '#333', fontSize: 16 },
  sendButton: { width: 50, height: '100%', justifyContent: 'center', alignItems: 'center' },
  
  spotifyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 8, marginTop: 6 },
  spotifyImage: { width: 50, height: 50, borderRadius: 8, marginRight: 8 },
  spotifyTitle: { fontSize: 14, fontWeight: 'bold', color: '#000', flex: 1 },
  spotifyFooter: { flexDirection: 'row', alignItems: 'center' },
  spotifyIcon: { width: 14, height: 14, tintColor: '#1DB954', marginRight: 4 },
  spotifySource: { fontSize: 11, color: '#1DB954' },
});

export default ChatHistorialScreen;