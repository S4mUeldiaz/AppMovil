// Fuente de verdad: velyshFrontend/src/styles/variables.css
// Cualquier cambio de paleta/tipografía se hace allá primero, y se traduce aquí.

export const colors = {
  // Alias legacy (colors.bg, colors.bgCard, colors.bgInput) — se mantienen
  // para no romper las pantallas que ya los usan (Home, Login, Register,
  // Sidebar, Carrito, Favoritos, Perfil). Todo código nuevo debe usar los
  // nombres largos (background, backgroundCard, backgroundInput).
  bg: '#000000',
  bgCard: '#191919',
  bgInput: '#2a2a2a',

  background: '#000000', // --color-bg
  backgroundCard: '#191919', // --color-bg-card
  backgroundInput: '#2a2a2a', // --color-bg-input
  primary: '#ffffff', // --color-primary
  primaryHover: '#d9d9d9', // --color-primary-hover (estado "pressed" del botón primario)
  text: '#ffffff', // --color-text
  textMuted: '#9a9a9a', // --color-text-muted
  border: '#333333', // --color-border
  overlay: 'rgba(255, 255, 255, 0.10)', // --color-overlay
  error: '#e63946', // --color-error — SOLO mensajes de error reales
  warning: '#d4a72c', // ámbar de stock bajo. No es var CSS en el web (es un
  // valor reutilizado a mano en DetalleProducto.css/QuickView.css), pero
  // aquí sí lo centralizamos como token para no repetir el string suelto.
};

export const fonts = {
  display: 'InriaSerif_400Regular', // --font-display, peso 400
  displayBold: 'InriaSerif_700Bold', // --font-display, peso 700
  bodyLight: 'Inter_300Light',
  body: 'Inter_400Regular', // --font-main, peso 400
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const radius = {
  sm: 8, // --border-radius
  lg: 16, // --border-radius-lg
  card: 12, // radio "duro" que se repite en tarjetas de producto y skeletons
  pill: 999, // botones/search bars/chips redondeados (50px en el web)
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Elevación sutil para cards sobre el fondo negro — casi imperceptible, no es
// un efecto Material Design genérico. shadowColor neutro (negro), no agrega paleta.
export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const theme = { colors, fonts, radius, spacing, shadow };

export default theme;
