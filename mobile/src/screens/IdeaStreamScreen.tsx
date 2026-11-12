import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { theme } from '../theme';
import { mobileApi } from '../services/api';
import { DiscoveryCandidate } from '../types';

export const IdeaStreamScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sparkModalVisible, setSparkModalVisible] = useState(false);
  const [sparkTarget, setSparkTarget] = useState({ type: 'general', content: '' });
  const [sparkComment, setSparkComment] = useState('');

  useEffect(() => {
    mobileApi.getDiscoveryFeed().then((res) => {
      setCandidates(res.candidates);
    }).catch(console.error);
  }, []);

  const current = candidates[currentIndex];

  const handleSparkPress = (type: string, content: string) => {
    setSparkTarget({ type, content });
    setSparkModalVisible(true);
  };

  const handleSendSpark = async () => {
    if (!current || !sparkComment.trim()) return;
    try {
      await mobileApi.sendSpark({
        receiver_id: current.profile.user_id,
        target_type: sparkTarget.type,
        target_content: sparkTarget.content,
        comment: sparkComment.trim(),
      });
      setSparkModalVisible(false);
      setSparkComment('');
      handleNext();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCandidates([]);
    }
  };

  if (!current) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
        <Text style={styles.emptySubtitle}>
          Check back shortly as new curious minds join Cupiddle in your area.
        </Text>
      </View>
    );
  }

  const { profile } = current;
  const photo = profile.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.card}>
        <Image source={{ uri: photo }} style={styles.photo} />
        
        <View style={styles.cardContent}>
          <Text style={styles.name}>{profile.display_name}, {profile.age}</Text>
          <Text style={styles.location}>{profile.city}, Nigeria • {profile.dating_intentions}</Text>

          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {/* 1. Rabbit Hole */}
          {profile.rabbit_hole ? (
            <View style={styles.promptBox}>
              <View style={styles.promptHeader}>
                <Text style={styles.promptLabel}>MY RABBIT HOLE</Text>
                <TouchableOpacity onPress={() => handleSparkPress('rabbit_hole', profile.rabbit_hole)}>
                  <Text style={styles.sparkButtonText}>✨ Spark This</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.promptText}>"{profile.rabbit_hole}"</Text>
            </View>
          ) : null}

          {/* 2. Defend This Take */}
          {profile.defend_take ? (
            <View style={[styles.promptBox, styles.coralBox]}>
              <View style={styles.promptHeader}>
                <Text style={[styles.promptLabel, { color: theme.colors.coral }]}>DEFEND THIS TAKE</Text>
                <TouchableOpacity onPress={() => handleSparkPress('defend_take', profile.defend_take)}>
                  <Text style={[styles.sparkButtonText, { color: theme.colors.coral }]}>🔥 Challenge / Spark</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.promptText}>"{profile.defend_take}"</Text>
            </View>
          ) : null}

          {/* 3. Teach Me Something */}
          {profile.teach_me ? (
            <View style={[styles.promptBox, styles.amberBox]}>
              <View style={styles.promptHeader}>
                <Text style={[styles.promptLabel, { color: theme.colors.amber }]}>TEACH ME SOMETHING</Text>
                <TouchableOpacity onPress={() => handleSparkPress('teach_me', profile.teach_me)}>
                  <Text style={[styles.sparkButtonText, { color: theme.colors.amber }]}>💡 Spark</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.promptText}>"{profile.teach_me}"</Text>
            </View>
          ) : null}

          {/* My World Tags */}
          {profile.my_world_tags?.length ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>MY WORLD</Text>
              <View style={styles.tagWrap}>
                {profile.my_world_tags.map((tag) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Pass & Spark Controls */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.passBtn} onPress={handleNext}>
              <Text style={styles.passBtnText}>Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sparkMainBtn}
              onPress={() => handleSparkPress('general', `Profile of ${profile.display_name}`)}
            >
              <Text style={styles.sparkMainBtnText}>✨ Send a Spark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Spark Modal */}
      <Modal visible={sparkModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Spark to {profile.display_name}</Text>
            <Text style={styles.modalSnippet}>"{sparkTarget.content}"</Text>
            
            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={4}
              placeholder="What sparked your curiosity about this?"
              placeholderTextColor="#8b7aa6"
              value={sparkComment}
              onChangeText={setSparkComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setSparkModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: theme.colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendSpark} style={styles.modalSendBtn}>
                <Text style={{ color: theme.colors.white, fontWeight: '700' }}>Send Spark</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.colors.bg },
  emptyTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.cardBorder, marginBottom: 40 },
  photo: { width: '100%', height: 360 },
  cardContent: { padding: 20 },
  name: { color: theme.colors.white, fontSize: 24, fontWeight: '800' },
  location: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 4, marginBottom: 12 },
  bio: { color: theme.colors.textPrimary, fontSize: 15, lineHeight: 22, marginBottom: 16 },
  promptBox: { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderRadius: theme.radius.md, padding: 14, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)', marginBottom: 14 },
  coralBox: { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' },
  amberBox: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  promptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  promptLabel: { color: theme.colors.primaryViolet, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  sparkButtonText: { color: theme.colors.coral, fontSize: 12, fontWeight: '700' },
  promptText: { color: theme.colors.white, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  sectionTitle: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPill: { backgroundColor: 'rgba(45, 31, 69, 0.8)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.radius.full },
  tagText: { color: theme.colors.lavenderLight, fontSize: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderColor: theme.colors.cardBorder },
  passBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.cardBorder },
  passBtnText: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 14 },
  sparkMainBtn: { backgroundColor: theme.colors.primaryViolet, paddingVertical: 12, paddingHorizontal: 28, borderRadius: theme.radius.full },
  sparkMainBtnText: { color: theme.colors.white, fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: 20, borderWidth: 1, borderColor: theme.colors.cardBorder },
  modalTitle: { color: theme.colors.white, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  modalSnippet: { color: theme.colors.lavenderLight, fontStyle: 'italic', fontSize: 13, marginBottom: 14 },
  modalInput: { backgroundColor: theme.colors.inputBg, borderRadius: theme.radius.md, padding: 12, color: theme.colors.white, fontSize: 14, minHeight: 80, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  modalSendBtn: { backgroundColor: theme.colors.coral, paddingVertical: 8, paddingHorizontal: 20, borderRadius: theme.radius.full },
});
