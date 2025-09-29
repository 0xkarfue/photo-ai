import { ValidationError } from "./validation"

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}m ${secs}s`
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    UPLOADED: 'blue',
    QUEUED: 'yellow',
    PROCESSING: 'orange',
    COMPLETED: 'green',
    FAILED: 'red'
  }
  return colors[status] || 'gray'
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const getErrorMessage = (error: any): string => {
  if (error instanceof ValidationError) {
    return error.message
  }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}