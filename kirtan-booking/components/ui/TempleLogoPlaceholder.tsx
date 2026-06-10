// TempleLogoPlaceholder — SSBBN Kirtan Panel
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

interface TempleLogoPlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export default function TempleLogoPlaceholder({ size = 'md', showName = true }: TempleLogoPlaceholderProps) {
  const dim = size === 'sm' ? 48 : size === 'md' ? 70 : 96;
  const fontSize = size === 'sm' ? FontSize.xs : size === 'md' ? FontSize.sm : FontSize.base;

  return (
    <View style={styles.container}>
      <View style={[styles.logo, { width: dim, height: dim, borderRadius: dim / 2 }]}>
        <Image
          source={require('../../assets/temple-logo.jpg')}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          resizeMode="cover"
        />
      </View>
      {showName && (
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { fontSize: fontSize + 2 }]}>SSBBN</Text>
          <Text style={[styles.subtitle, { fontSize: fontSize }]}>Kirtan Panel</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm },
  logo: {
    backgroundColor: Colors.saffronPale,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nameContainer: { alignItems: 'center' },
  name: { fontWeight: FontWeight.extrabold, color: Colors.white, letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
});
