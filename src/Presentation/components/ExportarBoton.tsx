import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme/AppTheme';
import { exportarExcel, exportarPDF } from '../utils/exportarReporte';

interface ExportarBotonProps {
  /** ej. "Reporte de inventario" — encabezado del PDF y de las alertas de error. */
  titulo: string;
  /** ej. "inventario" -> reporte_inventario_2026-09-22.xlsx */
  nombreBase: string;
  /** Encabezados, en el mismo orden que cada fila de `filas`. */
  columnas: string[];
  /** Una fila por elemento, mismo orden que `columnas`. Ya filtradas por la pantalla. */
  filas: (string | number)[][];
}

/** Botón "Exportar" con hoja de opciones Excel/PDF — mismo par de formatos que
 * el reporte equivalente en velyshFrontend, adaptado a un solo botón porque
 * en mobile la pantalla ya está cargada de tabs/filtros/buscador. */
export function ExportarBoton({ titulo, nombreBase, columnas, filas }: ExportarBotonProps) {
  const [abierto, setAbierto] = useState(false);
  const [exportando, setExportando] = useState<'excel' | 'pdf' | null>(null);

  async function manejarExcel() {
    setExportando('excel');
    try {
      await exportarExcel(columnas, filas, titulo, nombreBase);
      setAbierto(false);
    } catch {
      Alert.alert('No se pudo exportar', `No se pudo generar el Excel de "${titulo}". Intenta de nuevo.`);
    } finally {
      setExportando(null);
    }
  }

  async function manejarPDF() {
    setExportando('pdf');
    try {
      await exportarPDF(titulo, columnas, filas, nombreBase);
      setAbierto(false);
    } catch {
      Alert.alert('No se pudo exportar', `No se pudo generar el PDF de "${titulo}". Intenta de nuevo.`);
    } finally {
      setExportando(null);
    }
  }

  return (
    <>
      <TouchableOpacity style={styles.boton} onPress={() => setAbierto(true)}>
        <Feather name="download" size={14} color={colors.text} />
        <Text style={styles.botonTexto}>Exportar</Text>
      </TouchableOpacity>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => !exportando && setAbierto(false)}
          />

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.headerTexto}>{titulo}</Text>
              <TouchableOpacity onPress={() => !exportando && setAbierto(false)}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.opcion} onPress={manejarExcel} disabled={!!exportando}>
              {exportando === 'excel' ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Feather name="grid" size={18} color={colors.text} />
              )}
              <View style={styles.opcionTextos}>
                <Text style={styles.opcionTitulo}>Exportar a Excel</Text>
                <Text style={styles.opcionSub}>Archivo .xlsx</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.opcion} onPress={manejarPDF} disabled={!!exportando}>
              {exportando === 'pdf' ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Feather name="file-text" size={18} color={colors.text} />
              )}
              <View style={styles.opcionTextos}>
                <Text style={styles.opcionTitulo}>Exportar a PDF</Text>
                <Text style={styles.opcionSub}>Archivo .pdf</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  botonTexto: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.text },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerTexto: { fontFamily: fonts.display, fontSize: 17, color: colors.text, flex: 1, marginRight: spacing.md },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundInput,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  opcionTextos: { flex: 1 },
  opcionTitulo: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.text },
  opcionSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
