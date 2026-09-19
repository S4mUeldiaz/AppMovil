import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/AppTheme';

interface AnimatedHeartButtonProps {
  activo: boolean;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  colorActivo?: string;
  colorInactivo?: string;
}


export function AnimatedHeartButton({
  activo,
  onPress,
  size = 16,
  style,
  colorActivo = colors.favoriteActive,
  colorInactivo = colors.onPrimary,
}: AnimatedHeartButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    onPress();
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();
  }

  return (
    <TouchableOpacity style={style} onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {activo ? (
          <Ionicons name="heart" size={size} color={colorActivo} />
        ) : (
          <Feather name="heart" size={size} color={colorInactivo} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
