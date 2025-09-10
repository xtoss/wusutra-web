import { API_BASE_URL } from '@/lib/config'

export interface UploadResponse {
  status: string
  message: string
  local_url?: string
  s3_url?: string
  filename?: string
}

export interface TranscribeResponse {
  transcription?: string
  model_version?: string
  message?: string
  error?: string
}

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscribeResponse> => {
  const formData = new FormData()
  
  // Convert webm to a file with proper name
  const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
    type: 'audio/webm'
  })
  
  formData.append('audio_file', audioFile)

  try {
    const response = await fetch(`${API_BASE_URL}/v1/transcribe`, {
      method: 'POST',
      body: formData,
      // Add timeout to handle long processing
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.name === 'AbortError') {
        throw new Error('转写超时，请重试')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('连接服务器失败，请检查网络')
      }
    }
    throw error
  }
}

export const uploadRecording = async (
  audioBlob: Blob,
  text: string,
  dialect: string,
  transliteration?: string
): Promise<UploadResponse> => {
  const formData = new FormData()
  
  // Convert webm to a file with proper name
  const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, {
    type: 'audio/webm'
  })
  
  formData.append('file', audioFile)
  formData.append('text', text)
  formData.append('dialect', dialect)
  formData.append('user_id', 'web-user')
  
  if (transliteration) {
    formData.append('transliteration', transliteration)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/records`, {
      method: 'POST',
      body: formData,
      // Add timeout
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('上传超时，请重试')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('连接服务器失败，请检查网络或联系管理员')
      }
    }
    throw error
  }
}