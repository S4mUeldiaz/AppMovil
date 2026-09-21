import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme/AppTheme';

interface BackButtonProps {
  /** `solid`: sobre el fondo de la pantalla. `overlay`: flotando sobre una imagen. */
  variant?: 'solid' | 'overlay';
  /** Sobrescribe la acción por defecto (volver a la pantalla anterior). */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BACK_BUTTON_SIZE = 40;

export function BackButton({ variant = 'solid', onPress, style }: BackButtonProps) {
  const navigation = useNavigation();
  const overlay = variant === 'overlay';

  function volver() {
    if (onPress) return onPress();
    if (navigation.canGoBack()) navigation.goBack();
    // Sin historial (ej. Login abierto tras un reset por cerrar sesión): caer a la raíz de cliente.
    else (navigation as any).navigate('MainTabs');
  }

  return (
    <TouchableOpacity
      style={[styles.base, overlay ? styles.overlay : styles.solid, style]}
      onPress={volver}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <Feather name="arrow-left" size={20} color={overlay ? colors.onPrimary : colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overlay: {
    backgroundColor: colors.overlay,
  },
});
