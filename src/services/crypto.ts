/**
 * Utility for hashing passwords securely using browser Web Crypto API (SHA-256)
 * Never stores or compares passwords in plain text.
 */
export async function hashPassword(password: string, salt: string = 'eosis_secret_salt_2025'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(password: string, expectedHash: string, salt: string = 'eosis_secret_salt_2025'): Promise<boolean> {
  const hashed = await hashPassword(password, salt);
  return hashed === expectedHash;
}
