// StatCard — Admin Dashboard — SSBBN Kirtan Panel
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient?: [string, string];
}

export default function StatCard({ label, value, icon, gradient = [Colors.saffronLight, Colors.saffron] }: StatCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient colors={gradient} style={styles.iconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Ionicons name={icon} size={22} color={Colors.white} />
      </LinearGradient>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    flex: 1,
    margin: Spacing.xs,
    ...Shadow.sm,
  },
  iconContainer: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  value: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text },
  label: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 2, fontWeight: FontWeight.medium },
});
