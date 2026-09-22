import * as XLSX from 'xlsx';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// API nueva de expo-file-system (SDK 54+), la misma que ya usa
// FotoPerfilStorage.ts — Paths.cache es el directorio de archivos temporales
// de la app, no requiere permisos y el sistema puede limpiarlo solo.
import { File, Paths } from 'expo-file-system';

function fechaHoy(): string {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** ej. nombreArchivo('inventario', 'xlsx') -> "reporte_inventario_2026-09-22.xlsx" */
export function nombreArchivo(base: string, extension: 'xlsx' | 'pdf'): string {
  return `reporte_${base}_${fechaHoy()}.${extension}`;
}

/**
 * Genera un .xlsx con la misma librería y la misma API que usa el reporte
 * equivalente en velyshFrontend (XLSX.utils.json_to_sheet + book_new), y lo
 * comparte con la hoja nativa del dispositivo. `columnas` son los encabezados
 * y `filas` son arreglos de valores en ese mismo orden — misma forma que
 * recibe exportarPDF, para armar los datos una sola vez en la pantalla.
 */
export async function exportarExcel(
  columnas: string[],
  filas: (string | number)[][],
  nombreHoja: string,
  nombreBase: string
) {
  const filasObjeto = filas.map((fila) =>
    Object.fromEntries(columnas.map((col, i) => [col, fila[i]]))
  );
  const hoja = XLSX.utils.json_to_sheet(filasObjeto);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  const base64 = XLSX.write(libro, { type: 'base64', bookType: 'xlsx' });

  const destino = new File(Paths.cache, nombreArchivo(nombreBase, 'xlsx'));
  destino.create({ overwrite: true });
  destino.write(base64, { encoding: 'base64' });

  await compartir(destino.uri, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/**
 * Arma una tabla HTML simple (título + encabezados + filas) y la convierte a
 * PDF con expo-print. Es el equivalente RN de window.print() en el web: allá
 * el navegador convierte HTML a PDF vía su diálogo de impresión, acá lo hace
 * expo-print — mismo concepto (HTML -> PDF), sin dibujar el PDF a mano.
 */
export async function exportarPDF(
  titulo: string,
  columnas: string[],
  filas: (string | number)[][],
  nombreBase: string
) {
  const filasHtml = filas
    .map((fila) => `<tr>${fila.map((celda) => `<td>${celda}</td>`).join('')}</tr>`)
    .join('');
  const encabezadosHtml = columnas.map((c) => `<th>${c}</th>`).join('');

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #121212; padding: 24px; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          .fecha { color: #6b6b6b; font-size: 12px; margin: 0 0 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 8px 10px; background: #f1f1f0; border-bottom: 1px solid #e3e2e0; }
          td { padding: 8px 10px; border-bottom: 1px solid #e3e2e0; }
        </style>
      </head>
      <body>
        <h1>${titulo} — VELYSH</h1>
        <p class="fecha">Generado el ${fechaHoy()}</p>
        <table>
          <thead><tr>${encabezadosHtml}</tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const destino = new File(Paths.cache, nombreArchivo(nombreBase, 'pdf'));
  await new File(uri).copy(destino, { overwrite: true });

  await compartir(destino.uri, 'application/pdf');
}

async function compartir(uri: string, mimeType: string) {
  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) {
    throw new Error('Compartir archivos no está disponible en este dispositivo');
  }
  await Sharing.shareAsync(uri, { mimeType });
}
