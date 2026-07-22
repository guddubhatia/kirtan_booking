// Admin Login Screen — SSBBN Kirtan Panel
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import TempleLogoPlaceholder from '../../components/ui/TempleLogoPlaceholder';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

type Mode = 'login' | 'forgot';

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, resetPassword, isLoading, firebaseReady } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    setFormError(null);
    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setFormError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleForgot = async () => {
    setFormError(null);
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setFormError(err?.message || 'Could not send the reset email.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[Colors.saffronLight, Colors.saffron, Colors.saffronDark]}
        style={styles.topSection}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <TempleLogoPlaceholder size="lg" />
        <Text style={styles.adminLabel}>Admin Panel</Text>
        <Text style={styles.appLabel}>SSBBN Kirtan Booking Admin Panel</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.formWrapper}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#C62828" />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          {mode === 'login' ? (
            <>
              <Text style={styles.formTitle}>Admin Login</Text>
              <Text style={styles.formSub}>Sign in with your admin credentials</Text>

              {/* Email field */}
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrapper, !firebaseReady && styles.inputMuted]}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@ssbbn.org"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={firebaseReady}
                  />
                </View>
              </View>

              {/* Password field */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, !firebaseReady && styles.inputMuted]}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    editable={firebaseReady}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => { setFormError(null); setMode('forgot'); }} style={styles.forgotLink}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title={firebaseReady ? 'Sign In to Admin Panel' : 'Backend Not Configured'}
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={!firebaseReady}
                size="lg"
                style={styles.signInBtn}
                variant={firebaseReady ? 'primary' : 'outline'}
              />

              {!firebaseReady && (
                <Text style={styles.setupHint}>
                  Set <Text style={styles.setupCode}>EXPO_PUBLIC_FIREBASE_*</Text> values in your .env file
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Reset Password</Text>
              <Text style={styles.formSub}>Enter your email to receive a reset link</Text>

              {resetSent ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={28} color={Colors.kirtan} />
                  <Text style={styles.successText}>Password reset email sent! Check your inbox.</Text>
                </View>
              ) : (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="admin@ssbbn.org"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <Button title="Send Reset Email" onPress={handleForgot} isLoading={isLoading} size="lg" style={styles.signInBtn} />
                </>
              )}

              <TouchableOpacity onPress={() => { setFormError(null); setMode('login'); setResetSent(false); }} style={styles.forgotLink}>
                <Text style={styles.forgotText}>← Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  topSection: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.base, gap: Spacing.sm },
  backBtn: { position: 'absolute', top: Spacing.base, left: Spacing.base, padding: Spacing.xs },
  adminLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.white, marginTop: Spacing.sm },
  appLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  formWrapper: { flex: 1 },
  form: { padding: Spacing.xl, paddingTop: Spacing.lg },
  formTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  formSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.lg },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#FDECEA', borderColor: '#F5C6C3', borderWidth: 1,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.base,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: '#C62828', lineHeight: 20 },

  // Fields
  field: { marginBottom: Spacing.base },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.warmWhite, borderWidth: 1.5,
    borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
  },
  inputMuted: { backgroundColor: Colors.creamDark, borderColor: Colors.borderLight },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: FontSize.base, color: Colors.text },
  eyeBtn: { padding: Spacing.xs },
  forgotLink: { alignSelf: 'flex-end', marginBottom: Spacing.base },
  forgotText: { fontSize: FontSize.sm, color: Colors.saffron, fontWeight: FontWeight.semibold },
  signInBtn: { marginTop: Spacing.xs },
  setupHint: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.base, lineHeight: 18 },
  setupCode: { fontWeight: FontWeight.bold, color: Colors.saffronDark },
  successBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.kirtanLight, borderRadius: Radius.md, padding: Spacing.base, marginBottom: Spacing.base,
  },
  successText: { flex: 1, fontSize: FontSize.base, color: Colors.kirtan, lineHeight: 22 },
});
