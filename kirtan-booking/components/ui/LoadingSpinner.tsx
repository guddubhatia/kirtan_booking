// LoadingSpinner — SSBBN Kirtan Panel
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

export default function LoadingSpinner({ message, size = 'md', overlay = false }: LoadingSpinnerProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 900, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const dim = size === 'sm' ? 28 : size === 'md' ? 44 : 60;
  const border = size === 'sm' ? 3 : 4;

  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Animated.View style={[
          styles.spinner,
          { width: dim, height: dim, borderRadius: dim / 2, borderWidth: border },
          { transform: [{ rotate: spin }] },
        ]} />
      </Animated.View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(253,246,227,0.9)',
    zIndex: 100,
  },
  spinner: {
    borderColor: Colors.borderLight,
    borderTopColor: Colors.saffron,
    borderRightColor: Colors.gold,
  },
  message: { marginTop: Spacing.md, fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
});
