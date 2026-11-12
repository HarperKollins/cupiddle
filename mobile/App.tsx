import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { theme } from './src/theme';
import { mobileApi } from './src/services/api';
import { IdeaStreamScreen } from './src/screens/IdeaStreamScreen';
import { SparksInboxScreen } from './src/screens/SparksInboxScreen';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { AuthScreen } from './src/screens/AuthScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'sparks' | 'chat'>('stream');
  const [activeChat, setActiveChat] = useState<{ convId: string; partnerName: string } | null>(null);

  useEffect(() => {
    mobileApi.getMe().then(() => {
      setIsAuthenticated(true);
    }).catch(() => {
      setIsAuthenticated(false);
    });
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (activeChat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <StatusBar barStyle="light-content" />
        <ChatScreen
          convId={activeChat.convId}
          partnerName={activeChat.partnerName}
          onBack={() => setActiveChat(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.brandTitle}>Cupiddle</Text>
        <Text style={styles.freeBadge}>100% Free</Text>
      </View>

      {/* Screen Body */}
      <View style={{ flex: 1 }}>
        {activeTab === 'stream' && <IdeaStreamScreen />}
        {activeTab === 'sparks' && <SparksInboxScreen onNavigateToChat={() => setActiveTab('chat')} />}
        {activeTab === 'chat' && (
          <ConversationsScreen onOpenChat={(convId, partnerName) => setActiveChat({ convId, partnerName })} />
        )}
      </View>

      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('stream')}>
          <Text style={[styles.tabLabel, activeTab === 'stream' && styles.tabLabelActive]}>
            Idea Stream
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('sparks')}>
          <Text style={[styles.tabLabel, activeTab === 'sparks' && styles.tabLabelActive]}>
            Sparks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('chat')}>
          <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
            Conversations
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: theme.colors.cardBorder },
  brandTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  freeBadge: { backgroundColor: 'rgba(124, 58, 237, 0.2)', color: theme.colors.lavenderLight, fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.full },
  tabBar: { flexDirection: 'row', backgroundColor: theme.colors.card, borderTopWidth: 1, borderColor: theme.colors.cardBorder, paddingVertical: 12 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: theme.colors.primaryViolet, fontWeight: '800' },
});

