export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'auditing' | 'approved' | 'rejected'

export interface RecordingItem {
  id: string
  filename: string
  duration: number
  createdAt: Date
  text: string
  dialect: string
  phoneticTranscription: string
  status: UploadStatus
  uploadAttempts: number
  lastError?: string
  userId: string
  blob?: Blob
}

export interface Dialect {
  code: string
  name: string
}

export const dialects: Dialect[] = [
  { code: 'jiangyin', name: '江阴话' },
  { code: 'mandarin', name: '普通话' }
]