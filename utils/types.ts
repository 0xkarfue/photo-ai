export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  timestamp?: string
}

export interface User {
  id: string
  username: string
  createdAt: Date
}

export interface Upload {
  id: string
  userId: string
  imageCount: number
  faceCount: number
  status: 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
}

export interface Job {
  id: string
  uploadId: string
  prompt: string
  status: 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  createdAt: Date
  completedAt?: Date | null
}

export interface FaceData {
  imageIndex: number
  faceCount: number
  confidence: number
  boundingBoxes?: BoundingBox[]
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface UploadSession {
  uploadId: string
  sessionId: string
}

export interface GenerationJob {
  jobId: string
  estimatedTime: number
  status: string
  message: string
}

export interface JobStatus {
  jobId: string
  status: string
  progress: number
  currentStep: string
  message: string
  estimatedTimeRemaining: number
  resultId?: string
  error?: string
}

export interface GeneratedResult {
  id: string
  jobId: string
  image: {
    base64: string
    format: string
    dimensions: {
      width: number
      height: number
    }
    size: number
  }
  metadata?: {
    originalPrompt: string
    facesSwapped: number
    processingTime: number
    model: string
    uploadId: string
  }
  createdAt: Date
}

export interface UserProfile {
  user: {
    id: string
    username: string
    createdAt: Date
  }
  stats: {
    totalUploads: number
    totalGenerations: number
    completedGenerations: number
    facesProcessed: number
    lastActivity: Date
  }
}

export interface HistoryItem {
  id: string
  prompt: string
  status: string
  progress: number
  resultId: string | null
  thumbnail: string | null
  imageCount: number
  faceCount: number
  createdAt: Date
  completedAt: Date | null
  processingTime: number | null
}

export interface PaginatedHistory {
  history: HistoryItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PromptEnhancement {
  originalPrompt: string
  enhancedPrompt: string
  improvements: string[]
  processingTime: number
}