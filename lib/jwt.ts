// Shared JWT utilities using Web Crypto API (Edge & Node compatible)

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'jwt-secret-string-change-in-production';

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  iat?: number;
  exp?: number;
}

// Base64URL encode
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Base64URL decode
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return atob(padded);
}

// Create HMAC signature using Web Crypto API
async function createHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generate JWT token
export async function generateToken(user: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const payload: JWTPayload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };
  
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await createHmacSignature(`${header}.${body}`, JWT_SECRET);
  
  return `${header}.${body}.${signature}`;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const [header, body, signature] = token.split('.');
    
    if (!header || !body || !signature) {
      console.log('[JWT] Invalid token format - missing parts');
      return null;
    }
    
    const expectedSignature = await createHmacSignature(`${header}.${body}`, JWT_SECRET);
    
    if (signature !== expectedSignature) {
      console.log('[JWT] Signature mismatch');
      return null;
    }
    
    const payload: JWTPayload = JSON.parse(base64UrlDecode(body));
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('[JWT] Token expired');
      return null;
    }
    
    console.log('[JWT] Token verified successfully, role:', payload.role);
    return payload;
  } catch (error) {
    console.error('[JWT] Verification error:', error);
    return null;
  }
}
