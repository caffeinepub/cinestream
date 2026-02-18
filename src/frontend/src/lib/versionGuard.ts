/**
 * Version guard utility to ensure deterministic builds.
 * Validates that the deployed version matches the expected version.
 */

const EXPECTED_VERSION = '42';

export function validateVersion(): void {
  const currentVersion = import.meta.env.VITE_APP_VERSION || 'unknown';
  
  if (import.meta.env.PROD && currentVersion !== EXPECTED_VERSION) {
    console.error(
      `[Version Guard] Version mismatch detected!\n` +
      `Expected: ${EXPECTED_VERSION}\n` +
      `Current: ${currentVersion}\n` +
      `This build may not be deterministic.`
    );
  } else if (import.meta.env.DEV) {
    console.log(`[Version Guard] Running version ${currentVersion} in development mode`);
  } else {
    console.log(`[Version Guard] Version ${currentVersion} validated successfully`);
  }
}

export function getVersion(): string {
  return import.meta.env.VITE_APP_VERSION || 'unknown';
}
