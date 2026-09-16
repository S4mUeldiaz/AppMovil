const DIAS_PARA_SER_NUEVO = 30;

export function esProductoNuevo(fecha_creacion?: string): boolean {
  if (!fecha_creacion) return false;
  const dias = (Date.now() - new Date(fecha_creacion).getTime()) / (1000 * 60 * 60 * 24);
  return dias >= 0 && dias <= DIAS_PARA_SER_NUEVO;
}
