// Fuente de verdad: Design System VELYSH, tema "Light" (tokens.json).
// Comentarios = nombre del token de origen.

export const colors = {
  // Alias legacy — sin usos hoy en src/, se mantienen por compatibilidad.
  bg: '#fafafa', // surface-100
  bgCard: '#ffffff', // surface-200
  bgInput: '#f1f1f0', // surface-300

  background: '#fafafa', // surface-100 — fondo base de pantalla
  backgroundCard: '#ffffff', // surface-200 — cards, modales
  backgroundInput: '#f1f1f0', // surface-300 — inputs sobre cards, skeletons, chips inactivos
  primary: '#121212', // primary-action — fondo de botones/elementos primarios
  onPrimary: '#ffffff', // on-primary-action — SIEMPRE el texto/ícono sobre `primary`. Opuesto exacto de primary; nunca un literal aparte.
  primaryHover: '#3a3a3a', // sin token en el DS (estado "pressed" de primary) — valor derivado
  text: '#121212', // ink
  textMuted: '#6b6b6b', // ink-muted
  border: '#e3e2e0', // border
  overlay: 'rgba(18, 18, 18, 0.55)', // overlay-scrim
  overlayStrong: 'rgba(18, 18, 18, 0.75)', // sin token en el DS — variante intensa de overlay-scrim, solo para texto pequeño/crítico (≤11px) sobre fotos que pueden ser muy claras
  error: '#c0392b', // error — SOLO errores reales de validación/red
  warning: '#d4a72c', // accent-amber — stock bajo, badges "Más vendido"/"Nuevo"
  favoriteActive: '#e0273f', // favorite-active — solo el corazón de favorito activo
};

export const fonts = {
  display: 'InriaSerif_400Regular',
  displayBold: 'InriaSerif_700Bold',
  bodyLight: 'Inter_300Light',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const radius = {
  sm: 4, // radius-sm
  lg: 16, // radius-lg
  card: 8, // radius-md — cards de producto
  pill: 999, // radius-pill
};

export const spacing = {
  xs: 4, // space-1
  sm: 8, // space-2
  md: 12, // space-3
  lg: 16, // space-4
  xl: 24, // space-5
  xxl: 32, // space-6
  xxxl: 48, // space-8
};

export const shadow = {
  card: {
    // shadow-card light: 0 1px 3px rgba(18,18,18,0.08)
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
};

export const theme = { colors, fonts, radius, spacing, shadow };

export default theme;
