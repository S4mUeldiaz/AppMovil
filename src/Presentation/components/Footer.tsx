import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, spacing } from '../theme/AppTheme';

const CATEGORIAS_FOOTER = ['Hombre', 'Mujer', 'Deportivo', 'Casual', 'Botas'];

export function Footer() {
  const navigation = useNavigation();
  const anioActual = new Date().getFullYear();

  function irACategoria(categoria: string) {
    (navigation.navigate as any)('CatalogoScreen', { categoria });
  }

  function irAFavoritos() {
    navigation.navigate('FavoritosScreen' as never);
  }

  return (
    <View style={styles.footer}>
      <View style={styles.brand}>
        <Text style={styles.logo}>VELYSH</Text>
        <Text style={styles.tagline}>Estilo, comodidad real.</Text>
        <View style={styles.social}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/velyshcol/')}>
            <FontAwesome5 name="instagram" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://facebook.com/velyshcol')}>
            <FontAwesome5 name="facebook-f" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/573204689732')}>
            <FontAwesome5 name="whatsapp" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.col}>
        <Text style={styles.colTitle}>Categorías</Text>
        {CATEGORIAS_FOOTER.map((categoria) => (
          <TouchableOpacity key={categoria} onPress={() => irACategoria(categoria)}>
            <Text style={styles.link}>{categoria}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.col}>
        <Text style={styles.colTitle}>Empresa</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen' as never)}>
          <Text style={styles.link}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => (navigation.navigate as any)('CatalogoScreen')}>
          <Text style={styles.link}>Catálogo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={irAFavoritos}>
          <Text style={styles.link}>Favoritos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.col}>
        <Text style={styles.colTitle}>Contacto</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:velysh329@gmail.com')}>
          <Text style={styles.link}>velysh329@gmail.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+573204689732')}>
          <Text style={styles.link}>+57 320 468 9732</Text>
        </TouchableOpacity>
        <Text style={styles.muted}>Bogotá, Colombia</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>© {anioActual} VELYSH — Todos los derechos reservados</Text>
        <Text style={styles.bottomAcademico}>Proyecto académico SENA · Ficha 3278638</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  brand: { gap: spacing.xs },
  logo: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 3,
    color: colors.text,
  },
  tagline: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  social: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  col: { gap: spacing.sm },
  colTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  link: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, paddingVertical: 4 },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, paddingVertical: 4 },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  bottomText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  bottomAcademico: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
});
