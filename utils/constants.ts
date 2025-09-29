export const APP_NAME = 'PhotoAI'

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/signin',
    LOGOUT: '/api/auth/signout',
  },
  UPLOADS: {
    CREATE: '/api/uploads',
    IMAGES: '/api/uploads/images',
    DETAIL: (id: string) => `/api/uploads/${id}`,
  },
  GENERATION: {
    ENHANCE: '/api/generation/enhance-prompt',
    GENERATE: '/api/generation/generate',
    STATUS: '/api/generation/status',
  },
  RESULTS: {
    DETAIL: (id: string) => `/api/results/${id}`,
    DOWNLOAD: '/api/results/download',
  },
  USER: {
    PROFILE: '/api/user/profile',
    HISTORY: '/api/user/history',
  },
} as const

export const FILE_CONSTRAINTS = {
  MIN_IMAGES: 5,
  MAX_IMAGES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const

export const PROMPT_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 500,
} as const

export const STATUS_MESSAGES = {
  UPLOADED: 'Upload complete',
  QUEUED: 'In queue...',
  PROCESSING: 'Generating your image...',
  COMPLETED: 'Complete!',
  FAILED: 'Failed',
} as const

export const POLLING_INTERVAL = 2000 // 2 seconds