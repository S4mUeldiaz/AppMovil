import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getUsuarios, cambiarEstadoUsuario, UsuarioAdmin } from '../../../../Data/sources/remote/api/UsuariosApi';
import { AdminHeader } from '../../../components/AdminHeader';
import { colors, fonts, radius, spacing } from '../../../theme/AppTheme';

function formatearFecha(fecha: string | null): string {
  if (!fecha) return 'Nunca';
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function AdminUsuariosScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudieron cargar los usuarios');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function toggleEstado(usuario: UsuarioAdmin) {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    setProcesando(usuario.numero_documento);
    try {
      await cambiarEstadoUsuario(usuario.numero_documento, nuevoEstado);
      setUsuarios((prev) =>
        prev.map((u) => (u.numero_documento === usuario.numero_documento ? { ...u, estado: nuevoEstado } : u))
      );
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'No se pudo actualizar el estado');
    } finally {
      setProcesando(null);
    }
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  function renderItem({ item: u }: { item: UsuarioAdmin }) {
    const activo = u.estado === 'activo';
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Feather name="user" size={18} color={colors.text} />
          </View>
          <View style={styles.info}>
            <Text style={styles.nombre} numberOfLines={1}>
              {u.nombre} {u.apellido}
            </Text>
            <Text style={styles.correo} numberOfLines={1}>
              {u.correo}
            </Text>
          </View>
          <View style={[styles.badge, activo ? styles.badgeActivo : styles.badgeInactivo]}>
            <Text style={[styles.badgeText, activo ? styles.badgeTextActivo : styles.badgeTextInactivo]}>
              {activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.metaTexto}>Rol: {u.roles?.nombre_rol ?? '—'}</Text>
          <Text style={styles.metaTexto}>Última actividad: {formatearFecha(u.fecha_ultima_actividad)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.toggleBtn, activo ? styles.toggleBtnDesactivar : styles.toggleBtnActivar]}
          onPress={() => toggleEstado(u)}
          disabled={procesando === u.numero_documento}
        >
          <Text style={[styles.toggleBtnText, !activo && styles.toggleBtnTextActivar]}>
            {procesando === u.numero_documento ? '...' : activo ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AdminHeader titulo="Usuarios" subtitulo={`${usuariosFiltrados.length} usuarios`} />

      <View style={styles.buscador}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.buscadorInput}
          placeholder="Buscar por nombre o correo..."
          placeholderTextColor={colors.textMuted}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={cargando ? [] : usuariosFiltrados}
        keyExtractor={(u) => u.numero_documento}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTexto}>No se encontraron usuarios</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 50,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
    height: 44,
    marginBottom: spacing.lg,
  },
  buscadorInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  lista: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  nombre: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  correo: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: spacing.md, borderWidth: 1 },
  badgeActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  badgeInactivo: { backgroundColor: 'transparent', borderColor: colors.border },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 11 },
  badgeTextActivo: { color: colors.background },
  badgeTextInactivo: { color: colors.textMuted },
  cardMeta: { marginTop: spacing.md, gap: 2 },
  metaTexto: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  toggleBtn: {
    marginTop: spacing.md,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleBtnDesactivar: { borderColor: colors.error },
  toggleBtnActivar: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleBtnText: { color: colors.error, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  toggleBtnTextActivar: { color: colors.background },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyTexto: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14 },
});
