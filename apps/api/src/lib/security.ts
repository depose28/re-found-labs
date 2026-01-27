interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrlSecurity(url: string): UrlValidationResult {
  // Check URL length to prevent DoS
  if (url.length > 2048) {
    return { valid: false, error: 'URL too long (max 2048 characters)' };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Only allow http/https protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost variations
  if (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  ) {
    return { valid: false, error: 'Localhost not allowed' };
  }

  // Block private IP ranges using regex patterns
  const privateIpPatterns = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8 loopback
    /^169\.254\./, // 169.254.0.0/16 link-local
    /^0\./, // 0.0.0.0/8
  ];

  for (const pattern of privateIpPatterns) {
    if (pattern.test(hostname)) {
      return { valid: false, error: 'Private IP addresses not allowed' };
    }
  }

  // Block cloud metadata endpoints
  if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
    return { valid: false, error: 'Cloud metadata endpoints not allowed' };
  }

  // Block internal hostnames
  const blockedHostnames = ['internal', 'intranet', 'corp', 'private'];
  if (blockedHostnames.some((blocked) => hostname.includes(blocked))) {
    return { valid: false, error: 'Internal hostnames not allowed' };
  }

  return { valid: true };
}

export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}
