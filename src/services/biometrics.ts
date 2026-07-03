import * as LocalAuthentication from 'expo-local-authentication';

/** Há hardware biométrico (face/digital) no aparelho? */
export async function hasBiometricHardware(): Promise<boolean> {
  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}

/**
 * Solicita autenticação: usa biometria (reconhecimento facial / digital) quando
 * disponível e cai para o PIN/senha do aparelho como alternativa.
 * Retorna true se o usuário se autenticou com sucesso.
 */
export async function authenticate(reason = 'Desbloquear o Flui'): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false, // permite PIN/senha do aparelho
    });
    return res.success;
  } catch {
    return false;
  }
}
