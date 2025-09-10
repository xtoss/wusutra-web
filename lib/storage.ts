export interface LocalRecording {
  id: string
  filename: string
  blob: Blob
  duration: number
  createdAt: Date
  text?: string
  dialect: string
  phoneticTranscription?: string
  uploadStatus: 'pending' | 'uploaded' | 'failed'
  uploadedAt?: Date
}

const DB_NAME = 'wusutra-recordings'
const DB_VERSION = 1
const STORE_NAME = 'recordings'

class RecordingStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('uploadStatus', 'uploadStatus', { unique: false })
        }
      }
    })
  }

  async saveRecording(recording: LocalRecording): Promise<void> {
    try {
      if (!this.db) {
        console.log('Initializing IndexedDB...')
        await this.init()
      }
      
      console.log('Saving recording to IndexedDB:', recording.id)
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(recording)

        request.onsuccess = () => {
          console.log('Recording saved successfully:', recording.id)
          resolve()
        }
        request.onerror = () => {
          console.error('IndexedDB save error:', request.error)
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error in saveRecording:', error)
      throw error
    }
  }

  async getRecording(id: string): Promise<LocalRecording | null> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllRecordings(): Promise<LocalRecording[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('createdAt')
      const request = index.openCursor(null, 'prev') // Sort by createdAt descending
      const recordings: LocalRecording[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          recordings.push(cursor.value)
          cursor.continue()
        } else {
          resolve(recordings)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateRecording(id: string, updates: Partial<LocalRecording>): Promise<void> {
    console.log('Attempting to update recording:', id)
    const recording = await this.getRecording(id)
    console.log('Found recording:', recording ? 'yes' : 'no')
    
    if (!recording) {
      console.error('Recording not found in IndexedDB:', id)
      throw new Error('Recording not found')
    }

    const updated = { ...recording, ...updates }
    console.log('Updating recording with:', updates)
    await this.saveRecording(updated)
  }

  async deleteRecording(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingRecordings(): Promise<LocalRecording[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('uploadStatus')
      const request = index.getAll('pending')

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const recordingStorage = new RecordingStorage()