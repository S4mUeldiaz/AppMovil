export const colors = {
  bg: '#fafafa',
  bgCard: '#ffffff',
  bgInput: '#f1f1f0',
  background: '#fafafa', //fondo base de pantalla
  backgroundCard: '#ffffff', //cards, modales
  backgroundInput: '#f1f1f0', //inputs sobre cards, skeletons, chips inactivos
  primary: '#121212', //fondo de botones/elementos primarios
  onPrimary: '#ffffff',
  primaryHover: '#3a3a3a',
  text: '#121212', 
  textMuted: '#6b6b6b',
  border: '#e3e2e0',
  overlay: 'rgba(18, 18, 18, 0.55)',
  overlayStrong: 'rgba(18, 18, 18, 0.75)',
  error: '#c0392b', //SOLO errores reales de validación
  warning: '#d4a72c', //stock bajo, badges "Más vendido"/"Nuevo"
  favoriteActive: '#e0273f', //solo el corazón de favorito activo
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
  sm: 4,
  lg: 16, 
  card: 8, 
  pill: 999, 
};

export const spacing = {
  xs: 4, 
  sm: 8,
  md: 12,
  lg: 16, 
  xl: 24,
  xxl: 32,
  xxxl: 48, 
};

export const shadow = {
  card: {
    shadowColor: '#121212',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
};

export const theme = { colors, fonts, radius, spacing, shadow };

export default theme;
