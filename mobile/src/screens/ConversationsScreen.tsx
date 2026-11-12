import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { mobileApi } from '../services/api';
import { Conversation } from '../types';

export const ConversationsScreen: React.FC<{ onOpenChat: (convId: string, partnerName: string) => void }> = ({ onOpenChat }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    mobileApi.getConversations().then((res) => {
      setConversations(res.conversations);
    }).catch(console.error);
  }, []);

  if (conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Matches Yet</Text>
        <Text style={styles.emptySubtitle}>
          Accepted sparks become mutual connections. Start exploring in the Idea Stream!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Conversations</Text>
      {conversations.map((conv) => {
        const partner = conv.partner;
        const photo = partner?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

        return (
          <TouchableOpacity
            key={conv.id}
            style={styles.chatRow}
            onPress={() => onOpenChat(conv.id, partner?.display_name || 'Match')}
          >
            <Image source={{ uri: photo }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{partner?.display_name || 'Match'}</Text>
                {conv.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unread_count}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {conv.last_message?.content || 'Conversation sparked!'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.colors.bg },
  emptyTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  screenTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '800', marginBottom: 16 },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.colors.cardBorder },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  unreadBadge: { backgroundColor: theme.colors.coral, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  unreadText: { color: theme.colors.white, fontSize: 11, fontWeight: '700' },
  lastMsg: { color: theme.colors.textMuted, fontSize: 13 },
});
