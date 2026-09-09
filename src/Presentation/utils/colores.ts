const COLOR_HEX: Record<string, string> = {
  blanco: '#ffffff',
  negro: '#111111',
  rojo: '#e63946',
  azul: '#2563eb',
  rosado: '#f472b6',
  rosa: '#f472b6',
  verde: '#22c55e',
  amarillo: '#eab308',
  gris: '#9ca3af',
  morado: '#8b5cf6',
  violeta: '#8b5cf6',
  naranja: '#f97316',
  cafe: '#7c4a3a',
  café: '#7c4a3a',
  marron: '#7c4a3a',
  marrón: '#7c4a3a',
  beige: '#d8c3a5',
  dorado: '#caa44a',
  plateado: '#c0c0c0',
  vinotinto: '#7c1f2a',
  turquesa: '#2dd4bf',
};

export function getColorHex(nombreColor?: string | null): string {
  if (!nombreColor) return '#9a9a9a';
  const clave = nombreColor.toLowerCase().trim();
  return COLOR_HEX[clave] || clave;
}