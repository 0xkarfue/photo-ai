interface UploadData {
  images: Buffer[]
  faces: any[]
  metadata: any
}

interface JobData {
  status: string
  progress: number
  result?: string
  error?: string
  imageData?: string  // ADD THIS
  imageUrl?: string 
}

class MemoryStore {
  private uploads: Map<string, UploadData> = new Map()
  private jobs: Map<string, JobData> = new Map()

  setUpload(id: string, data: UploadData) {
    this.uploads.set(id, data)
  }

  getUpload(id: string): UploadData | undefined {
    return this.uploads.get(id)
  }

  setJob(id: string, data: JobData) {
    this.jobs.set(id, data)
  }

  getJob(id: string): JobData | undefined {
    return this.jobs.get(id)
  }

  updateJob(id: string, data: Partial<JobData>) {
    const existing = this.jobs.get(id)
    if (existing) {
      this.jobs.set(id, { ...existing, ...data })
    }
  }
}

export const memoryStore = new MemoryStore()