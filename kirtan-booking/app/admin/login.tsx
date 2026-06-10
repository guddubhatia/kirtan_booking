// Admin Login Screen — SSBBN Kirtan Panel
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
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
  const { login, loginDemo, resetPassword, isLoading, firebaseReady } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message);
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    router.replace('/admin/dashboard');
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message);
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

          {mode === 'login' ? (
            <>
              <Text style={styles.formTitle}>Admin Login</Text>
              <Text style={styles.formSub}>Sign in with your admin credentials</Text>

              {/* Demo Mode Card — always visible */}
              <View style={styles.demoCard}>
                <View style={styles.demoCardHeader}>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>DEMO</Text>
                  </View>
                  <Text style={styles.demoTitle}>Quick Admin Access</Text>
                </View>
                <Text style={styles.demoBody}>
                  Tap below to enter the Admin Panel instantly with demo credentials.
                </Text>
                <View style={styles.credBox}>
                  <Text style={styles.credLabel}>📧 Email: <Text style={styles.credValue}>admin@ssbbn.org</Text></Text>
                  <Text style={styles.credLabel}>🔑 Password: <Text style={styles.credValue}>demo1234</Text></Text>
                </View>
                <TouchableOpacity onPress={handleDemoLogin} style={styles.demoBtn} activeOpacity={0.85}>
                  <LinearGradient
                    colors={[Colors.saffronLight, Colors.saffron]}
                    style={styles.demoBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="play-circle" size={20} color={Colors.white} />
                    <Text style={styles.demoBtnText}>Enter Admin Panel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with credentials</Text>
                <View style={styles.dividerLine} />
              </View>

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

              <TouchableOpacity onPress={() => setMode('forgot')} style={styles.forgotLink}>
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
                  Set <Text style={styles.setupCode}>EXPO_PUBLIC_BACKEND_URL</Text> in your .env file
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

              <TouchableOpacity onPress={() => { setMode('login'); setResetSent(false); }} style={styles.forgotLink}>
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

  // Demo card
  demoCard: {
    backgroundColor: Colors.saffronPale,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.saffronLight,
  },
  demoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  demoBadge: {
    backgroundColor: Colors.saffron,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  demoBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.extrabold, letterSpacing: 0.5 },
  demoTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  demoBody: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.sm },
  credBox: {
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  credLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  credValue: { fontWeight: FontWeight.bold, color: Colors.saffronDark },
  demoBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  demoBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 13, borderRadius: Radius.md,
  },
  demoBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  dividerText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },

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
