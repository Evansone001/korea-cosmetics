// Security middleware and utilities for CRM integration

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// API Key validation
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const validKey = process.env.ADMIN_API_KEY;
  
  if (!validKey) {
    console.error('ADMIN_API_KEY not configured');
    return false;
  }
  
  return apiKey === validKey;
}

// Role-based access control
export function requireRole(role: 'admin' | 'store') {
  return function(request: NextRequest): boolean {
    // In production, this would verify JWT token and check user role
    // For now, using header-based role identification
    const userRole = request.headers.get('X-User-Role');
    const userId = request.headers.get('X-User-Id');
    
    if (!userRole || !userId) {
      return false;
    }
    
    return userRole === role;
  };
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Generate webhook signature for outgoing requests
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Sanitize product data to prevent injection
export function sanitizeProductData(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Remove potentially dangerous keys
    if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
        .substring(0, 10000); // Limit string length
    } else if (typeof value === 'number') {
      sanitized[key] = Math.max(0, Math.min(value, 999999999)); // Clamp numbers
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.filter(item => typeof item === 'string').slice(0, 100);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeProductData(value);
    }
  }
  
  return sanitized;
}

// IP-based rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  return { allowed: true, remaining: maxRequests - current.count };
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Audit logger
export async function logAuditEvent(event: {
  action: string;
  userId: string;
  userRole: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    ...event,
  };
  
  // In production, send to logging service (Datadog, Splunk, etc.)
  // For now, log to console and optionally to database
  console.log('AUDIT:', JSON.stringify(logEntry));
  
  // Send to webhook if configured
  const auditWebhook = process.env.AUDIT_WEBHOOK_URL;
  if (auditWebhook) {
    try {
      await fetch(auditWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Audit-Secret': process.env.AUDIT_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send audit log:', error);
    }
  }
}

// Input validation
export function validateProductDistribution(data: unknown): {
  valid: boolean;
  errors: string[];
  sanitized?: Record<string, unknown>;
} {
  const errors: string[] = [];
  
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Invalid request body'] };
  }
  
  const body = data as Record<string, unknown>;
  
  // Validate productIds
  if (!Array.isArray(body.productIds)) {
    errors.push('productIds must be an array');
  } else if (body.productIds.length === 0) {
    errors.push('productIds cannot be empty');
  } else if (body.productIds.length > 100) {
    errors.push('Cannot distribute more than 100 products at once');
  } else {
    // Validate each product ID
    for (const id of body.productIds) {
      if (typeof id !== 'string' || id.length < 1 || id.length > 100) {
        errors.push(`Invalid product ID: ${id}`);
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        errors.push(`Product ID contains invalid characters: ${id}`);
      }
    }
  }
  
  // Validate storeId
  if (typeof body.storeId !== 'string' || body.storeId.length < 1) {
    errors.push('storeId is required');
  } else if (!/^[a-zA-Z0-9_-]+$/.test(body.storeId)) {
    errors.push('storeId contains invalid characters');
  }
  
  // Validate pricing if provided
  if (body.pricing) {
    if (typeof body.pricing !== 'object') {
      errors.push('pricing must be an object');
    } else {
      const pricing = body.pricing as Record<string, unknown>;
      if (pricing.markup !== undefined) {
        if (typeof pricing.markup !== 'number' || pricing.markup < 0 || pricing.markup > 1000) {
          errors.push('markup must be a number between 0 and 1000');
        }
      }
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Sanitize
  const sanitized = sanitizeProductData(data) || {};
  
  return { valid: true, errors: [], sanitized };
}

// CORS check for CRM endpoints
export function checkCors(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  if (!origin) return true; // Allow non-browser requests
  
  return allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith(allowed)
  );
}
