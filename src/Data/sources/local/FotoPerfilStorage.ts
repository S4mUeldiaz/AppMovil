import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

const KEY_PREFIX = '@velysh_foto_perfil:';
const CARPETA = 'perfil';

function claveStorage(numero_documento: string) {
  return `${KEY_PREFIX}${numero_documento}`;
}

export async function obtenerFotoPerfil(numero_documento: string): Promise<string | null> {
  const uri = await AsyncStorage.getItem(claveStorage(numero_documento));
  if (!uri) return null;

  const archivo = new File(uri);
  if (!archivo.exists) {
    await AsyncStorage.removeItem(claveStorage(numero_documento));
    return null;
  }
  return uri;
}

export async function guardarFotoPerfil(numero_documento: string, uriTemporal: string): Promise<string> {
  const carpeta = new Directory(Paths.document, CARPETA);
  if (!carpeta.exists) {
    carpeta.create({ intermediates: true });
  }

  const destino = new File(carpeta, `${numero_documento}.jpg`);
  const origen = new File(uriTemporal);
  await origen.copy(destino, { overwrite: true });

  await AsyncStorage.setItem(claveStorage(numero_documento), destino.uri);
  return destino.uri;
}
