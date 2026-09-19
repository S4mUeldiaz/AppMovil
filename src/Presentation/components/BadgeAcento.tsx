import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/AppTheme';

interface BadgeAcentoProps {
  texto: string;
  style?: StyleProp<ViewStyle>;
}

/** Pill ámbar de acento ocasional (stock bajo, más vendido, nuevo) — nunca más de uno por card. */
export function BadgeAcento({ texto, style }: BadgeAcentoProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.overlayStrong,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  texto: {
    color: colors.warning,
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
