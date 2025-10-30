// ChatScreen.js
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

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isNewConversation, setIsNewConversation] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const sh = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hd = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { sh.remove(); hd.remove(); };
  }, []);

  // --- Función para detectar links (sin duplicar) ---
  const extractLinks = (text) => {
    const regex = /(https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+)/g;
    const matches = text.match(regex);
    if (!matches) return [];
    return [...new Set(matches)]; // eliminar duplicados
  };

  // --- Función para obtener metadata del track ---
  const fetchSpotifyMetadata = async (url) => {
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=${url}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        title: data.title,
        thumbnail: data.thumbnail_url,
        provider: data.provider_name
      };
    } catch (error) {
      console.error('Error obteniendo metadata de Spotify:', error);
      return null;
    }
  };

  // --- Renderiza texto con tarjetas de Spotify ---
  const renderMessageContent = (text) => {
    const links = extractLinks(text);
    if (!links.length) return <Text style={styles.messageText}>{text}</Text>;

    return (
      <View>
        <Text style={styles.messageText}>
          {text.replace(/https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+/g, '').trim()}
        </Text>
        {links.map((link, i) => (
          <SpotifyCard key={i} url={link} />
        ))}
      </View>
    );
  };

  // --- Componente de tarjeta Spotify ---
  const SpotifyCard = ({ url }) => {
    const [meta, setMeta] = useState(null);

    useEffect(() => {
      fetchSpotifyMetadata(url).then(setMeta);
    }, [url]);

    return (
      <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.spotifyCard}>
        {meta ? (
          <>
            <Image source={{ uri: meta.thumbnail }} style={styles.spotifyImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.spotifyTitle}>{meta.title}</Text>
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
          <View style={styles.spotifyLoading}>
            <ActivityIndicator color="#1DB954" size="small" />
            <Text style={{ color: '#1DB954', marginLeft: 8 }}>Cargando...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // --- Envío de mensaje ---
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
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setInputText('');
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Take a Brake</Text>
              <View style={styles.headerStatus}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>En línea</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setMessages([])} style={styles.newChatButton}>
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.sender === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                {renderMessageContent(item.text)}
                <Text
                  style={[
                    styles.messageTime,
                    item.sender === 'user' ? styles.userMessageTime : styles.botMessageTime
                  ]}
                >
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.chatContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

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
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={[
                  styles.sendButton,
                  (isSending || !inputText.trim()) && styles.disabledButton
                ]}
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
      </TouchableWithoutFeedback>
    </View>
  );
};

// --- Estilos ---
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
  chatContainer: { padding: 16 },
  messageContainer: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 12 },
  botMessage: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#c38aea' },
  messageText: { fontSize: 16, color: '#333' },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  userMessageTime: { color: 'rgba(255,255,255,0.7)' },
  botMessageTime: { color: '#666' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  inputContainerAtBottom: { paddingBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10
  },
  sendButton: {
    backgroundColor: '#c38aea',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: { backgroundColor: '#c38aea80' },
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
  spotifyLoading: { flexDirection: 'row', alignItems: 'center', padding: 8 }
});

export default ChatScreen;
