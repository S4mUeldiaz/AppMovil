import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, fonts } from '../theme/AppTheme';

// Ancho completo del grid de 2 columnas: 2 * CARD_WIDTH + CARD_GAP
// = SCREEN_WIDTH - 24 * 2 (padding horizontal del grid).
const ANCHO_BANNER = Dimensions.get('window').width - 24 * 2;

interface BannerCategoriaProps {
  imagen: string;
  nombre: string;
  onPress: () => void;
}

export function BannerCategoria({ imagen, nombre, onPress }: BannerCategoriaProps) {
  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: imagen }} style={styles.img} resizeMode="contain" />
      <Text style={styles.texto}>{nombre}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: ANCHO_BANNER,
    aspectRatio: 4 / 5,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.backgroundInput,
  },
  img: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  texto: {
    color: colors.onPrimary,
    fontFamily: fonts.display,
    fontSize: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.overlay,
  },
});
