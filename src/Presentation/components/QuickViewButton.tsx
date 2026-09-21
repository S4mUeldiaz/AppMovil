import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../theme/AppTheme';

interface QuickViewButtonProps {
  onPress: () => void;
}

// Fila de acción a todo el ancho de la card, entre la imagen y la info.
// Vive fuera de la imagen para no tapar el producto, sea cual sea la proporción de la foto.
export function QuickViewButton({ onPress }: QuickViewButtonProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Feather name="eye" size={14} color={colors.text} />
      <Text style={styles.text}>Vista rápida</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    height: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  text: { color: colors.text, fontSize: 11, fontFamily: fonts.bodyMedium },
});
