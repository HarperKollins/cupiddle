import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { mobileApi } from '../services/api';
import { Message } from '../types';

export const ChatScreen: React.FC<{ convId: string; partnerName: string; onBack: () => void }> = ({
  convId,
  partnerName,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    mobileApi.getMessages(convId).then((res) => {
      setMessages(res.messages);
    }).catch(console.error);
  }, [convId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const msg = await mobileApi.sendMessage(convId, input.trim());
      setMessages([...messages, msg]);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 6 }}>
          <Text style={{ color: theme.colors.primaryViolet, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{partnerName}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesList} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {messages.map((m) => {
          const isMine = m.sender_id !== partnerName; // Simple distinction
          return (
            <View
              key={m.id}
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{m.content}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Share a curious thought..."
          placeholderTextColor="#8b7aa6"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Text style={{ color: theme.colors.white, fontWeight: '700' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.card },
  headerTitle: { color: theme.colors.white, fontSize: 17, fontWeight: '800' },
  messagesList: { flex: 1 },
  messageBubble: { padding: 12, borderRadius: theme.radius.md, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: theme.colors.deepViolet },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.cardBorder },
  messageText: { color: theme.colors.white, fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.card, gap: 8 },
  input: { flex: 1, backgroundColor: theme.colors.inputBg, borderRadius: theme.radius.full, paddingHorizontal: 16, color: theme.colors.white },
  sendBtn: { backgroundColor: theme.colors.primaryViolet, paddingHorizontal: 18, justifyContent: 'center', borderRadius: theme.radius.full },
});
