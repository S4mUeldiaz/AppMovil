import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton, BACK_BUTTON_SIZE } from './BackButton';
import { colors, fonts, spacing } from '../theme/AppTheme';

interface BackHeaderProps {
  titulo?: string;
  /** Acción opcional a la derecha (mismo ancho que el botón de volver, para que el título quede centrado). */
  right?: ReactNode;
  onBack?: () => void;
}

/** Header de pantallas secundarias: botón de volver + título, respetando el safe area superior. */
export function BackHeader({ titulo, right, onBack }: BackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.sm }]}>
      <BackButton onPress={onBack} />
      <Text style={styles.titulo} numberOfLines={1}>
        {titulo}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    paddingHorizontal: spacing.sm,
  },
  right: {
    width: BACK_BUTTON_SIZE,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
