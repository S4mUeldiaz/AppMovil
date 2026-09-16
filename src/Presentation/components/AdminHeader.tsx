import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logout } from '../../Data/sources/remote/api/Authapi';
import { colors, fonts, spacing } from '../theme/AppTheme';

interface AdminHeaderProps {
  titulo: string;
  subtitulo?: string;
}

export function AdminHeader({ titulo, subtitulo }: AdminHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  async function handleLogout() {
    await logout();
    (navigation as any).reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  }

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.sm }]}>
      <View>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  titulo: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  subtitulo: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  logoutBtn: { padding: spacing.xs },
});
