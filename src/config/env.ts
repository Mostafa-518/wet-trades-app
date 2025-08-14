
// Environment configuration
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Construction Management',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Development flags
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Feature flags
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV,
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

export function validateEnv() {
  const missingVars = requiredEnvVars.filter(
    (key) => !import.meta.env[key] && !env.API_BASE_URL.includes('localhost')
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using default values for development.'
    );
  }
}

// Call validation on import
validateEnv();
