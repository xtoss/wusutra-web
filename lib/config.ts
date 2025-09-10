/**
 * Application configuration
 * Single source of truth for API endpoints and other config
 */

// Try to import local config (only exists in dev environment)
let localConfig: { api: { baseUrl: string; trainingUrl: string } } | null = null;
try {
  // This will fail in production/when file doesn't exist
  localConfig = require('./config-local').localConfig;
} catch {
  // config-local.ts doesn't exist, use defaults
}

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 
             (localConfig?.api.baseUrl) || 
             '', // Empty string for public repository
    trainingUrl: process.env.NEXT_PUBLIC_TRAINING_API_URL || 
                 (localConfig?.api.trainingUrl) || 
                 '' // Empty string for public repository
  }
} as const

// Export for easy access
export const API_BASE_URL = config.api.baseUrl
export const TRAINING_API_URL = config.api.trainingUrl