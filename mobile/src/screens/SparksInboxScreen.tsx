import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { mobileApi } from '../services/api';
import { Spark } from '../types';

export const SparksInboxScreen: React.FC<{ onNavigateToChat: () => void }> = ({ onNavigateToChat }) => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    loadSparks();
  }, []);

  const loadSparks = async () => {
    try {
      const res = await mobileApi.getIncomingSparks();
      setSparks(res.sparks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await mobileApi.acceptSpark(id);
      loadSparks();
      onNavigateToChat();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePass = async (id: string) => {
    try {
      await mobileApi.passSpark(id);
      loadSparks();
    } catch (err) {
      console.error(err);
    }
  };

  if (sparks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Pending Sparks</Text>
        <Text style={styles.emptySubtitle}>
          When someone discovers your Rabbit Hole or profile takes and sparks a response, it will appear here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Sparks Inbox ({sparks.length})</Text>
      {sparks.map((spark) => (
        <View key={spark.id} style={styles.card}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: spark.sender_profile?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.senderName}>{spark.sender_profile?.display_name}, {spark.sender_profile?.age}</Text>
              <Text style={styles.senderCity}>{spark.sender_profile?.city || 'Nigeria'}</Text>
            </View>
          </View>

          <View style={styles.targetBox}>
            <Text style={styles.targetLabel}>In response to your {spark.target_type.replace('_', ' ')}:</Text>
            <Text style={styles.targetContent}>"{spark.target_content}"</Text>
          </View>

          <View style={styles.commentBox}>
            <Text style={styles.commentText}>"{spark.comment}"</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handlePass(spark.id)} style={styles.passBtn}>
              <Text style={styles.passBtnText}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAccept(spark.id)} style={styles.acceptBtn}>
              <Text style={styles.acceptBtnText}>Accept & Match</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.colors.bg },
  emptyTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  screenTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '800', marginBottom: 16 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.cardBorder },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  senderName: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  senderCity: { color: theme.colors.textMuted, fontSize: 12 },
  targetBox: { backgroundColor: 'rgba(76, 29, 149, 0.2)', padding: 10, borderRadius: theme.radius.sm, marginBottom: 10 },
  targetLabel: { color: theme.colors.primaryViolet, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  targetContent: { color: theme.colors.lavenderLight, fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  commentBox: { backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: 12, borderRadius: theme.radius.md, marginBottom: 14 },
  commentText: { color: theme.colors.white, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  passBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.cardBorder },
  passBtnText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
  acceptBtn: { backgroundColor: theme.colors.coral, paddingVertical: 8, paddingHorizontal: 20, borderRadius: theme.radius.full },
  acceptBtnText: { color: theme.colors.white, fontSize: 13, fontWeight: '700' },
});
