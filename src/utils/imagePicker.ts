import * as ImagePicker from 'expo-image-picker';

export type PickedImage = { base64: string; mime?: string; uri: string };

type Opts = { aspect?: [number, number] };

function fromResult(res: ImagePicker.ImagePickerResult): PickedImage | null {
  if (res.canceled || !res.assets?.[0]?.base64) return null;
  const a = res.assets[0];
  return { base64: a.base64 as string, mime: a.mimeType, uri: a.uri };
}

export async function pickFromGallery(opts: Opts = {}): Promise<PickedImage | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.4,
    base64: true,
    allowsEditing: true,
    aspect: opts.aspect,
  });
  return fromResult(res);
}

/** Retorna null se a permissão de câmera for negada. */
export async function pickFromCamera(opts: Opts = {}): Promise<PickedImage | null | 'denied'> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return 'denied';
  const res = await ImagePicker.launchCameraAsync({
    quality: 0.4,
    base64: true,
    allowsEditing: true,
    aspect: opts.aspect,
  });
  return fromResult(res);
}
