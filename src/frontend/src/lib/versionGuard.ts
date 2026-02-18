/**
 * Version validation utility for deterministic builds
 */

const EXPECTED_VERSION = '42';

export function validateVersion(): void {
  const currentVersion = import.meta.env.VITE_APP_VERSION;
  
  if (currentVersion !== EXPECTED_VERSION) {
    console.warn(
      `[Version Mismatch] Expected version ${EXPECTED_VERSION}, but got ${currentVersion}. ` +
      'This may indicate a deployment issue.'
    );
  }
}

// Run validation in production builds
if (import.meta.env.PROD) {
  validateVersion();
}
