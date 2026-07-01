import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

/** Escreve um PNG (base64) num arquivo temporário e devolve a URI. */
async function writeTempPng(base64: string): Promise<string> {
  const fileUri = `${FileSystem.cacheDirectory}movel-card-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return fileUri;
}

/** Salva o card (base64 PNG) na galeria do aparelho. */
export async function saveCardToGallery(base64: string): Promise<void> {
  const perm = await MediaLibrary.requestPermissionsAsync(true);
  if (!perm.granted) {
    throw new Error('Permissão da galeria negada. Habilite nas configurações.');
  }
  const fileUri = await writeTempPng(base64);
  await MediaLibrary.saveToLibraryAsync(fileUri);
}

/** Abre o seletor nativo de compartilhamento com o card (base64 PNG). */
export async function shareCard(base64: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento indisponível neste aparelho.');
  }
  const fileUri = await writeTempPng(base64);
  await Sharing.shareAsync(fileUri, { mimeType: 'image/png', dialogTitle: 'Compartilhar' });
}
