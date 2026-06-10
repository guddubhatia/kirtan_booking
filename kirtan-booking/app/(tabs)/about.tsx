// About Screen — SSBBN Kirtan Panel
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '../../components/ui/Header';
import TempleLogoPlaceholder from '../../components/ui/TempleLogoPlaceholder';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Header title="About" subtitle="SSBBN Kirtan Panel" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Temple Info Card */}
        <LinearGradient
          colors={[Colors.saffronLight, Colors.saffron, Colors.saffronDark]}
          style={styles.templeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TempleLogoPlaceholder size="lg" />
          <Text style={styles.templeSubtitle}>Jai Babe Di</Text>
        </LinearGradient>

        {/* Info Rows */}
        <View style={styles.infoCard}>
          <InfoRow icon="home" label="Temple" value="SSBBN Temple" />
          <InfoRow icon="apps" label="App" value="SSBBN Kirtan Panel" divider />
          <InfoRow icon="information-circle" label="Version" value="1.0.0" divider />
        </View>

        {/* Color Legend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calendar Color Guide</Text>
          <LegendRow color={Colors.kirtan} bg={Colors.kirtanLight} label="Kirtan" desc="Kirtan sabha events" />
          <LegendRow color={Colors.unavailable} bg={Colors.unavailableLight} label="Unavailable" desc="Temple closed or unavailable" />
        </View>

        {/* Admin Access — hidden in client-only builds */}
        {process.env.EXPO_PUBLIC_IS_ADMIN_BUILD !== 'false' && (
          <TouchableOpacity onPress={() => router.push('/admin/login')} style={styles.adminCard} activeOpacity={0.85}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.saffron} />
            <View style={styles.adminText}>
              <Text style={styles.adminTitle}>Admin Panel</Text>
              <Text style={styles.adminSub}>Manage events and announcements</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Made with ❤️ for the sangat{'\n'}Sat Sri Akal 🙏
        </Text>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, divider }: { icon: any; label: string; value: string; divider?: boolean }) {
  return (
    <>
      {divider && <View style={styles.divider} />}
      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={18} color={Colors.saffron} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </>
  );
}

function LegendRow({ color, bg, label, desc }: { color: string; bg: string; label: string; desc: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View style={[styles.legendBadge, { backgroundColor: bg }]}>
        <Text style={[styles.legendLabel, { color }]}>{label}</Text>
      </View>
      <Text style={styles.legendDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.base },
  templeCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
    ...Shadow.md,
  },
  templeSubtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', fontStyle: 'italic' },
  infoCard: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.base, ...Shadow.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  infoIcon: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.saffronPale, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  infoLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  card: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.base, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  legendLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  legendDesc: { flex: 1, fontSize: FontSize.xs, color: Colors.textMuted },
  adminCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  adminText: { flex: 1 },
  adminTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  adminSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  footer: { textAlign: 'center', fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 22, marginTop: Spacing.xl },
});
