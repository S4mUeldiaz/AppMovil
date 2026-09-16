import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme/AppTheme';

export interface ItemAgregado {
  imagen: string | null;
  nombre: string;
  color: string;
  talla: string;
  cantidad: number;
}

interface AgregarCarritoModalProps {
  item: ItemAgregado | null;
  onClose: () => void;
  onIrCarrito: () => void;
}

export function AgregarCarritoModal({ item, onClose, onIrCarrito }: AgregarCarritoModalProps) {
  if (!item) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={styles.headerTexto}>Añadido al carrito</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.producto}>
            <View style={styles.imgWrap}>
              {item.imagen ? (
                <Image source={{ uri: item.imagen }} style={styles.img} resizeMode="contain" />
              ) : (
                <Feather name="image" size={22} color={colors.textMuted} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.nombre} numberOfLines={2}>
                {item.nombre}
              </Text>
              <Text style={styles.variante}>
                {item.color} · Talla {item.talla} · Cant. {item.cantidad}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.irCarritoBtn} onPress={onIrCarrito}>
            <Feather name="shopping-bag" size={16} color={colors.background} />
            <Text style={styles.irCarritoText}>Ir al carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.seguirBtn} onPress={onClose}>
            <Text style={styles.seguirText}>Seguir viendo el catálogo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTexto: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  producto: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  imgWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: '80%', height: '80%' },
  info: { flex: 1, gap: 4 },
  nombre: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  variante: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 },
  irCarritoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
  },
  irCarritoText: { color: colors.background, fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.5 },
  seguirBtn: { alignItems: 'center', paddingVertical: spacing.md },
  seguirText: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 },
});
