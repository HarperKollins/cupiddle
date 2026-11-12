import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../theme';
import { mobileApi } from '../services/api';

export const AuthScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('2001-01-01'); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await mobileApi.login({ email, password });
      } else {
        // 18+ validation check
        const dob = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age < 18) {
          Alert.alert('Age Verification', 'You must be at least 18 years old to join Cupiddle.');
          setLoading(false);
          return;
        }

        await mobileApi.register({
          email,
          password,
          display_name: name,
          birthdate,
          gender: 'Woman',
          city: 'Lagos',
          country: 'Nigeria',
        });
      }
      onSuccess();
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brandTitle}>Cupiddle</Text>
      <Text style={styles.tagline}>Curiosity is attractive</Text>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Display Name"
              placeholderTextColor="#8b7aa6"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Birthdate YYYY-MM-DD (18+ Mandatory)"
              placeholderTextColor="#8b7aa6"
              value={birthdate}
              onChangeText={setBirthdate}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#8b7aa6"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8b7aa6"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitBtnText}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Join Free (18+)'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', padding: 24 },
  brandTitle: { color: theme.colors.white, fontSize: 36, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  tagline: { color: theme.colors.lavenderLight, fontSize: 14, textAlign: 'center', marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, padding: 24, borderWidth: 1, borderColor: theme.colors.cardBorder },
  toggleRow: { flexDirection: 'row', backgroundColor: theme.colors.inputBg, borderRadius: theme.radius.sm, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: theme.colors.deepViolet },
  toggleText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },
  toggleTextActive: { color: theme.colors.white },
  input: { backgroundColor: theme.colors.inputBg, borderRadius: theme.radius.sm, padding: 12, color: theme.colors.white, marginBottom: 12, fontSize: 14 },
  submitBtn: { backgroundColor: theme.colors.primaryViolet, borderRadius: theme.radius.full, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: theme.colors.white, fontSize: 15, fontWeight: '800' },
});

