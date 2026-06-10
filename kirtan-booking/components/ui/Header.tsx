// Header Component — SSBBN Kirtan Panel
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { router } from 'expo-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
  variant?: 'gradient' | 'plain';
}

export default function Header({ title, subtitle, showBack = false, rightAction, variant = 'gradient' }: HeaderProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.inner, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={variant === 'gradient' ? Colors.white : Colors.saffron} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, variant === 'plain' && styles.titlePlain]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, variant === 'plain' && styles.subtitlePlain]}>{subtitle}</Text> : null}
        </View>

        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.rightBtn} hitSlop={12}>
            <Ionicons name={rightAction.icon} size={24} color={variant === 'gradient' ? Colors.white : Colors.saffron} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient colors={[Colors.saffron, Colors.saffronDark]} style={styles.gradient}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={styles.plain}>{content}</View>;
}

const styles = StyleSheet.create({
  gradient: { paddingBottom: Spacing.lg },
  plain: { backgroundColor: Colors.warmWhite, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: Spacing.md },
  inner: { paddingHorizontal: Spacing.base },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContainer: { flex: 1, alignItems: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white, textAlign: 'center' },
  titlePlain: { color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  subtitlePlain: { color: Colors.textMuted },
  backBtn: { width: 40, alignItems: 'flex-start' },
  rightBtn: { width: 40, alignItems: 'flex-end' },
  placeholder: { width: 40 },
});
