export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export const validateUsername = (username: string): void => {
  if (!username || typeof username !== 'string') {
    throw new ValidationError('Username is required')
  }
  if (username.length < 3) {
    throw new ValidationError('Username must be at least 3 characters')
  }
  if (username.length > 30) {
    throw new ValidationError('Username must be less than 30 characters')
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ValidationError('Username can only contain letters, numbers, and underscores')
  }
}

export const validatePassword = (password: string): void => {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required')
  }
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters')
  }
  if (password.length > 100) {
    throw new ValidationError('Password is too long')
  }
}

export const validateImageCount = (count: number): void => {
  if (!count || typeof count !== 'number') {
    throw new ValidationError('Image count is required')
  }
  if (count < 5 || count > 10) {
    throw new ValidationError('Image count must be between 5 and 10')
  }
}

export const validatePrompt = (prompt: string): void => {
  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Prompt is required')
  }
  if (prompt.length < 3) {
    throw new ValidationError('Prompt must be at least 3 characters')
  }
  if (prompt.length > 500) {
    throw new ValidationError('Prompt must be less than 500 characters')
  }
}

export const validateImageFile = (file: File): void => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!validTypes.includes(file.type)) {
    throw new ValidationError('Invalid file type. Only JPEG, PNG, and WebP are allowed')
  }
  
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    throw new ValidationError('File size must be less than 10MB')
  }
}
