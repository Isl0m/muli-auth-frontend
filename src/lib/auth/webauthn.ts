import { AttestationConveyanceFormat, AuthenticatorTransport } from '@simplewebauthn/server';

export interface WebAuthnRegistrationOptions {
  challenge: BufferSource;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: BufferSource;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    alg: number;
    type: string;
  }>;
  timeout?: number;
  attestation?: AttestationConveyanceFormat;
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'preferred' | 'required' | 'discouraged';
    userVerification?: 'preferred' | 'required' | 'discouraged';
  };
}

export interface WebAuthnAuthenticationOptions {
  challenge: BufferSource;
  timeout?: number;
  rpId: string;
  userVerification?: 'preferred' | 'required' | 'discouraged';
  allowCredentials?: Array<{
    id: BufferSource;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }>;
}

export function generateChallenge(): ArrayBuffer {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return buffer.buffer;
}

export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function createRegistrationOptions(
  userId: string,
  userEmail: string,
  userName: string
): Promise<WebAuthnRegistrationOptions> {
  return {
    challenge: generateChallenge(),
    rp: {
      name: 'Secure Auth App',
      id: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    },
    user: {
      id: new TextEncoder().encode(userId),
      name: userEmail,
      displayName: userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    timeout: 60000,
    attestation: 'direct',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  };
}

export async function createAuthenticationOptions(
  rpId: string,
  credentialIds?: string[]
): Promise<WebAuthnAuthenticationOptions> {
  return {
    challenge: generateChallenge(),
    timeout: 60000,
    rpId,
    userVerification: 'preferred',
    allowCredentials: credentialIds
      ? credentialIds.map((id) => ({
          id: base64ToBuffer(id),
          type: 'public-key',
          transports: ['usb', 'nfc', 'ble', 'internal'],
        }))
      : undefined,
  };
}

/**
 * For production use, integrate with @simplewebauthn/server
 * Example:
 *
 * import {
 *   generateRegistrationOptions,
 *   verifyRegistrationResponse,
 *   generateAuthenticationOptions,
 *   verifyAuthenticationResponse,
 * } from '@simplewebauthn/server';
 *
 * const options = generateRegistrationOptions({
 *   rpID: "example.com",
 *   rpName: "My App",
 *   userID: "user123",
 *   userName: "user@example.com",
 *   userDisplayName: "User Name",
 * });
 */
