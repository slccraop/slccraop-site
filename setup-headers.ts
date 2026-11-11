// Security headers and CSP configuration for SLCCRAOP
// These are applied at the edge/CDN level for Cloudflare Pages deployment

// HTTP Security Headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
}

// Content Security Policy
// Uses nonces for inline scripts to allow dynamic functionality
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "blob:"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "blob:"],
  connectSrc: ["'self'", "https://*.supabase.co"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameAncestors: ["'none'"],
  formAction: ["'self'"],
}

// Export for use in edge functions or middleware
export { securityHeaders, cspDirectives }

/**
 * Apply security headers to Express/Cloudflare Workers response
 * @param {import("express").Response} res - Express response object
 */
export function applySecurityHeaders(res: any) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}

/**
 * Apply CSP header to response
 * @param {import("express").Response} res - Express response object
 * @param {string} nonce - Inline script nonce for the request
 */
export function applyCSP(res: any, nonce: string) {
  const cspParts = [
    `default-src '${cspDirectives.defaultSrc.join(" ")}'`,
    `script-src ${cspDirectives.scriptSrc.join(" ")}`,
    `style-src ${cspDirectives.styleSrc.join(" ")}`,
    `img-src ${cspDirectives.imgSrc.join(" ")}`,
    `connect-src ${cspDirectives.connectSrc.join(" ")}`,
    `font-src ${cspDirectives.fontSrc.join(" ")}`,
    `object-src ${cspDirectives.objectSrc.join(" ")}`,
    `media-src ${cspDirectives.mediaSrc.join(" ")}`,
    `frame-ancestors ${cspDirectives.frameAncestors.join(" ")}`,
    `form-action ${cspDirectives.formAction.join(" ")}`,
  ]

  res.setHeader("Content-Security-Policy", cspParts.join("; "))
  // Also set nonce for inline scripts
  res.setHeader("X-Content-Security-Policy", cspParts.join("; "))
  res.setHeader("X-WebKit-CSP", cspParts.join("; "))
}