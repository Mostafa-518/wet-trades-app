/**
 * Content Security Policy configuration for enhanced security
 */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://mcjdeqfqbucfterqzglp.supabase.co'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'frame-ancestors': ["'none'"]
};

/**
 * Applies security headers to a window/document
 */
export const applySecurityHeaders = (win: Window): void => {
  if (!win.document) return;

  // Create meta tag for CSP
  const meta = win.document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = Object.entries(CSP_POLICY)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');

  // Add to head
  const head = win.document.head || win.document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(meta);
  }

  // Add additional security meta tags
  const securityMetas = [
    { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
    { httpEquiv: 'X-Frame-Options', content: 'DENY' },
    { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
    { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
  ];

  securityMetas.forEach(({ httpEquiv, content }) => {
    const metaTag = win.document.createElement('meta');
    metaTag.httpEquiv = httpEquiv;
    metaTag.content = content;
    head?.appendChild(metaTag);
  });
};

/**
 * Rate limiting for sensitive operations
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the time window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const createRateLimiter = (maxAttempts?: number, windowMs?: number) => 
  new RateLimiter(maxAttempts, windowMs);