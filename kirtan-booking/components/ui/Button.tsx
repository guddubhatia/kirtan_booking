// Button Component — SSBBN Kirtan Panel
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  isLoading = false, disabled = false, style, textStyle,
}: ButtonProps) {
  const sizeStyles = sizes[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.85}
        style={[styles.wrapper, sizeStyles.wrapper, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[Colors.saffronLight, Colors.saffron, Colors.saffronDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles.inner]}
        >
          {isLoading
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <Text style={[styles.primaryText, sizeStyles.text, textStyle]}>{title}</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyles.inner,
        variantStyles[variant],
        disabled && styles.disabled,
        style,
      ]}
    >
      {isLoading
        ? <ActivityIndicator color={variant === 'outline' ? Colors.saffron : Colors.white} size="small" />
        : <Text style={[styles.text, sizeStyles.text, variantText[variant], textStyle]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const sizes = {
  sm: {
    wrapper: { borderRadius: Radius.md },
    inner: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base, borderRadius: Radius.md },
    text: { fontSize: FontSize.sm },
  },
  md: {
    wrapper: { borderRadius: Radius.lg },
    inner: { paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: Radius.lg },
    text: { fontSize: FontSize.base },
  },
  lg: {
    wrapper: { borderRadius: Radius.xl },
    inner: { paddingVertical: 18, paddingHorizontal: Spacing.xxl, borderRadius: Radius.xl },
    text: { fontSize: FontSize.md },
  },
};

const variantStyles: Record<string, object> = {
  secondary: { backgroundColor: Colors.creamDark },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.saffron },
  danger: { backgroundColor: Colors.error },
  ghost: { backgroundColor: 'transparent' },
};

const variantText: Record<string, object> = {
  secondary: { color: Colors.text },
  outline: { color: Colors.saffron },
  danger: { color: Colors.white },
  ghost: { color: Colors.saffron },
};

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden' },
  gradient: { alignItems: 'center', justifyContent: 'center' },
  base: { alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.3 },
  text: { fontWeight: FontWeight.semibold },
  disabled: { opacity: 0.5 },
});
