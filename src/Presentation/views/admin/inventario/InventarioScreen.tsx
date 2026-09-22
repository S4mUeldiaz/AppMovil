import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getStock, Stock } from '../../../../Data/sources/remote/api/StockApi';
import { getCategorias, Categoria } from '../../../../Data/sources/remote/api/ProductosApi';
import { AdminHeader } from '../../../components/AdminHeader';
import { ExportarBoton } from '../../../components/ExportarBoton';
import { colors, fonts, radius, spacing } from '../../../theme/AppTheme';

type NivelFiltro = '' | 'disponible' | 'bajo' | 'agotado';

const NIVEL_LABEL: Record<string, string> = {
  disponible: 'Normal',
  bajo: 'Stock bajo',
  agotado: 'Sin stock',
};

function colorNivel(estado: string) {
  if (estado === 'bajo') return colors.warning;
  if (estado === 'agotado') return colors.error;
  return colors.textMuted;
}

export function AdminInventarioScreen() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [nivelFiltro, setNivelFiltro] = useState<NivelFiltro>('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [s, c] = await Promise.all([getStock(), getCategorias()]);
      setStock(s);
      setCategorias(c);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo cargar el inventario');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const resumen = useMemo(() => {
    const totalProductos = stock.length;
    const stockBajo = stock.filter((s) => s.estado === 'bajo').length;
    const sinStock = stock.filter((s) => s.estado === 'agotado').length;
    const valorStock = stock.reduce((acc, s) => acc + s.stock_actual * (s.productos?.precio ?? 0), 0);
    return { totalProductos, stockBajo, sinStock, valorStock };
  }, [stock]);

  const stockFiltrado = stock.filter((s) => {
    const coincideBusqueda = s.productos?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ?? true;
    const coincideCategoria = categoriaFiltro ? s.productos?.id_categoria === categoriaFiltro : true;
    const coincideNivel = nivelFiltro ? s.estado === nivelFiltro : true;
    return coincideBusqueda && coincideCategoria && coincideNivel;
  });

  // Filas del reporte exportable: por variante (no agregadas por producto,
  // a diferencia de Reportes.jsx en el web) — así respeta exactamente lo que
  // el admin tenga filtrado en pantalla (categoría/nivel/búsqueda).
  const COLUMNAS_EXPORT = ['Producto', 'Referencia', 'Color', 'Talla', 'Stock actual', 'Stock mínimo', 'Stock máximo', 'Estado', 'Valor'];
  const filasExport = stockFiltrado.map((s) => {
    const valorTotal = s.stock_actual * (s.productos?.precio ?? 0);
    return [
      s.productos?.nombre ?? '',
      s.productos?.referencia ?? '',
      s.color,
      s.tallas?.talla ?? '',
      s.stock_actual,
      s.stock_minimo,
      s.stock_maximo,
      NIVEL_LABEL[s.estado] ?? s.estado,
      valorTotal,
    ];
  });

  function renderItem({ item: s }: { item: Stock }) {
    const valorTotal = s.stock_actual * (s.productos?.precio ?? 0);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.info}>
            <Text style={styles.nombre} numberOfLines={1}>
              {s.productos?.nombre ?? 'Producto'}
            </Text>
            <Text style={styles.referencia} numberOfLines={1}>
              {s.productos?.referencia} · {s.color} · Talla {s.tallas?.talla}
            </Text>
          </View>
          <View style={[styles.badge, { borderColor: colorNivel(s.estado) }]}>
            <Text style={[styles.badgeText, { color: colorNivel(s.estado) }]}>
              {NIVEL_LABEL[s.estado] ?? s.estado}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View>
            <Text style={styles.metaLabel}>Unidades</Text>
            <Text style={styles.metaValor}>{s.stock_actual}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Valor unitario</Text>
            <Text style={styles.metaValor}>${Number(s.productos?.precio ?? 0).toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Valor total</Text>
            <Text style={styles.metaValor}>${valorTotal.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AdminHeader titulo="Inventario" />

      <View style={styles.exportarRow}>
        <ExportarBoton
          titulo="Reporte de inventario"
          nombreBase="inventario"
          columnas={COLUMNAS_EXPORT}
          filas={filasExport}
        />
      </View>

      <FlatList
        data={cargando ? [] : stockFiltrado}
        keyExtractor={(s) => String(s.id_stock)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <View style={styles.resumenGrid}>
              <View style={[styles.resumenCard, { borderLeftColor: colors.textMuted }]}>
                <Text style={styles.resumenNum}>{resumen.totalProductos}</Text>
                <Text style={styles.resumenLabel}>Referencias</Text>
              </View>
              <View style={[styles.resumenCard, { borderLeftColor: colors.warning }]}>
                <Text style={styles.resumenNum}>{resumen.stockBajo}</Text>
                <Text style={styles.resumenLabel}>Stock bajo</Text>
              </View>
              <View style={[styles.resumenCard, { borderLeftColor: colors.primary }]}>
                <Text style={styles.resumenNum}>${(resumen.valorStock / 1000000).toFixed(1)}M</Text>
                <Text style={styles.resumenLabel}>Valor stock</Text>
              </View>
              <View style={[styles.resumenCard, { borderLeftColor: colors.error }]}>
                <Text style={styles.resumenNum}>{resumen.sinStock}</Text>
                <Text style={styles.resumenLabel}>Sin stock</Text>
              </View>
            </View>

            <View style={styles.buscador}>
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.buscadorInput}
                placeholder="Buscar producto..."
                placeholderTextColor={colors.textMuted}
                value={busqueda}
                onChangeText={setBusqueda}
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsRow}
              data={[{ id_categoria: null, nombre_categoria: 'Todas' } as any, ...categorias]}
              keyExtractor={(item) => String(item.id_categoria)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pill, categoriaFiltro === item.id_categoria && styles.pillActive]}
                  onPress={() => setCategoriaFiltro(item.id_categoria)}
                >
                  <Text style={[styles.pillText, categoriaFiltro === item.id_categoria && styles.pillTextActive]}>
                    {item.nombre_categoria}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsRow}
              data={[
                { value: '' as NivelFiltro, label: 'Todos los niveles' },
                { value: 'disponible' as NivelFiltro, label: 'Normal' },
                { value: 'bajo' as NivelFiltro, label: 'Stock bajo' },
                { value: 'agotado' as NivelFiltro, label: 'Sin stock' },
              ]}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pill, nivelFiltro === item.value && styles.pillActive]}
                  onPress={() => setNivelFiltro(item.value)}
                >
                  <Text style={[styles.pillText, nivelFiltro === item.value && styles.pillTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={
          !cargando ? (
            <View style={styles.emptyState}>
              <Feather name="box" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTexto}>No se encontró stock con estos filtros</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  exportarRow: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  resumenCard: {
    width: '47%',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  resumenNum: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 18 },
  resumenLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
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
    marginBottom: spacing.md,
  },
  buscadorInput: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  pillsRow: { paddingLeft: spacing.xl, marginBottom: spacing.md },
  pill: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12 },
  pillTextActive: { color: colors.onPrimary },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  lista: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  info: { flex: 1 },
  nombre: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  referencia: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: radius.pill, borderWidth: 1, paddingVertical: 3, paddingHorizontal: spacing.sm },
  badgeText: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 0.5 },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaLabel: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 10, marginBottom: 2 },
  metaValor: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyTexto: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14 },
});
