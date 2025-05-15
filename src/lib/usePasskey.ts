import { useState, useCallback } from 'react';

// Проверка поддержки WebAuthn
function isWebAuthnAvailable() {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
}

// Генерация случайного challenge
function randomChallenge(length = 32) {
  const arr = new Uint8Array(length);
  window.crypto.getRandomValues(arr);
  return arr;
}

// AES-GCM шифрование/дешифрование
async function aesGcmEncrypt(data: Uint8Array, key: CryptoKey): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
  );
  return { iv, ciphertext };
}

async function aesGcmDecrypt(ciphertext: Uint8Array, key: CryptoKey, iv: Uint8Array): Promise<Uint8Array> {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new Uint8Array(decrypted);
}

// Получение CryptoKey из credential (через deriveBits)
async function deriveAesKeyFromCredential(credential: PublicKeyCredential): Promise<CryptoKey> {
  // Используем rawId как seed для PBKDF2 (или просто как key material)
  const rawId = credential.rawId;
  // Для простоты: импортируем rawId как ключ (256 бит)
  return window.crypto.subtle.importKey(
    'raw',
    rawId,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export function usePasskey() {
  const [isAvailable, setIsAvailable] = useState(isWebAuthnAvailable());
  const [error, setError] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);

  // Регистрация Passkey
  const register = useCallback(async (userId: string) => {
    setError(null);
    if (!isWebAuthnAvailable()) {
      setIsAvailable(false);
      setError('WebAuthn не поддерживается');
      return null;
    }
    try {
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge: randomChallenge(),
        rp: { name: 'TON MVP' },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: userId,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { userVerification: 'preferred', residentKey: 'preferred' },
        timeout: 60000,
        attestation: 'none',
      };
      const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;
      if (!credential) throw new Error('Не удалось создать Passkey');
      setCredentialId(Buffer.from(credential.rawId).toString('base64'));
      return credential;
    } catch (e: any) {
      setError(e.message || 'Ошибка регистрации Passkey');
      return null;
    }
  }, []);

  // Аутентификация Passkey
  const authenticate = useCallback(async (credentialIdBase64?: string) => {
    setError(null);
    if (!isWebAuthnAvailable()) {
      setIsAvailable(false);
      setError('WebAuthn не поддерживается');
      return null;
    }
    try {
      const allowCredentials = credentialIdBase64
        ? [{
            id: Uint8Array.from(atob(credentialIdBase64), c => c.charCodeAt(0)),
            type: 'public-key' as const,
          }]
        : undefined;
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: randomChallenge(),
        allowCredentials,
        userVerification: 'preferred',
        timeout: 60000,
      };
      const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;
      if (!assertion) throw new Error('Не удалось пройти аутентификацию');
      setCredentialId(Buffer.from(assertion.rawId).toString('base64'));
      return assertion;
    } catch (e: any) {
      setError(e.message || 'Ошибка аутентификации Passkey');
      return null;
    }
  }, []);

  // Шифрование данных с помощью Passkey
  const encryptWithPasskey = useCallback(async (data: Uint8Array, credential: PublicKeyCredential) => {
    const key = await deriveAesKeyFromCredential(credential);
    return aesGcmEncrypt(data, key);
  }, []);

  // Дешифрование данных с помощью Passkey
  const decryptWithPasskey = useCallback(async (ciphertext: Uint8Array, iv: Uint8Array, credential: PublicKeyCredential) => {
    const key = await deriveAesKeyFromCredential(credential);
    return aesGcmDecrypt(ciphertext, key, iv);
  }, []);

  return {
    isAvailable,
    error,
    credentialId,
    register,
    authenticate,
    encryptWithPasskey,
    decryptWithPasskey,
  };
} 