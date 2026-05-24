const crypto = require('crypto');

/**
 * Decodes a base32 string into a Buffer.
 */
function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let cleaned = input.replace(/=+$/, '').toUpperCase();
  let bits = '';
  let output = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) throw new Error('Invalid base32 character');
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    output.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(output);
}

/**
 * Computes a TOTP code for a given secret and counter.
 */
function getTOTP(secret, counter) {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  
  // Write counter as 64-bit integer
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = temp & 0xff;
    temp = temp >> 8;
  }
  
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
               
  return String(code % 1000000).padStart(6, '0');
}

/**
 * Verifies a TOTP token against a secret with time drift tolerance.
 */
function verifyTOTP(token, secret) {
  try {
    const counter = Math.floor(Date.now() / 1000 / 30);
    // Allow a drift of 1 time-step (30s) before and after
    for (let i = -1; i <= 1; i++) {
      const computed = getTOTP(secret, counter + i);
      if (computed === token) return true;
    }
  } catch (err) {
    console.error('[TOTP] Verification error:', err.message);
  }
  return false;
}

/**
 * Generates a random base32 secret.
 */
function generateBase32Secret(length = 16) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += alphabet[bytes[i] % alphabet.length];
  }
  return secret;
}

module.exports = {
  verifyTOTP,
  generateBase32Secret
};
