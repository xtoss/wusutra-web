'use client'

import { useState, useEffect } from 'react'
import { RecordingItem, dialects } from '@/types'
import { uploadRecording, transcribeAudio } from '@/utils/api'
import { recordingStorage } from '@/lib/storage'

interface TranslationModalProps {
  recording: RecordingItem
  isOpen: boolean
  onClose: () => void
  onSubmit: (text: string, phoneticText: string) => void
}

export default function TranslationModal({ 
  recording, 
  isOpen, 
  onClose, 
  onSubmit 
}: TranslationModalProps) {
  const [text, setText] = useState('')
  const [phoneticText, setPhoneticText] = useState('')
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setText(recording.text || '')
      setPhoneticText(recording.phoneticTranscription || '')
    }
  }, [isOpen, recording])

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getDialectName = (code: string) => {
    return dialects.find(d => d.code === code)?.name || code
  }

  const handleAITranscribe = async () => {
    if (!recording.blob) {
      setUploadError('录音文件丢失')
      return
    }

    setIsLoadingTranscription(true)
    setUploadError('')

    try {
      const response = await transcribeAudio(recording.blob)
      console.log('Transcription response:', response)
      
      if (response.transcription) {
        setText(response.transcription)
      } else {
        setUploadError(response.message || response.error || 'AI转写失败')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      setUploadError(error instanceof Error ? error.message : 'AI转写失败')
    } finally {
      setIsLoadingTranscription(false)
    }
  }

  const handleSubmit = async () => {
    if (!recording.blob) {
      setUploadError('录音文件丢失')
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      const response = await uploadRecording(
        recording.blob,
        text.trim(),
        recording.dialect,
        phoneticText.trim() || undefined
      )

      if (response.status === 'success') {
        // Check if recording exists in IndexedDB before updating
        try {
          const existingRecording = await recordingStorage.getRecording(recording.id)
          if (existingRecording) {
            await recordingStorage.updateRecording(recording.id, {
              uploadStatus: 'uploaded',
              uploadedAt: new Date()
            })
          } else {
            console.warn('Recording not found in IndexedDB, skipping status update')
          }
        } catch (updateError) {
          console.error('Failed to update recording status:', updateError)
          // Don't fail the whole process if status update fails
        }
        
        onSubmit(text.trim(), phoneticText.trim())
        onClose()
      } else {
        setUploadError(response.message || '上传失败')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  const isValid = text.trim().length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black w-full max-w-md mx-4 rounded-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button 
            onClick={onClose}
            className="text-blue-500 text-lg"
          >
            取消
          </button>
          <h2 className="text-lg font-semibold">第3步：输入正确文字</h2>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Recording Details */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">录音详情</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>🎵</span>
                  <span>{recording.filename}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱</span>
                  <span>{formatDuration(recording.duration)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span>🌍</span>
                <span>方言: {getDialectName(recording.dialect)}</span>
              </div>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">输入正确文字</h3>
              <span className="text-sm text-gray-500">{text.length} 字符</span>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入您刚才用方言说的标准文字内容"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                请输入您刚才用方言说的标准文字内容
              </span>
              <button 
                onClick={handleAITranscribe}
                disabled={isLoadingTranscription}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                {isLoadingTranscription ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    <span>转写中</span>
                  </>
                ) : (
                  <>
                    <span>✏️</span>
                    <span>AI转写</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Phonetic Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🔤</span>
              <h3 className="font-semibold text-lg">音译 (选填)</h3>
            </div>
            
            <textarea
              value={phoneticText}
              onChange={(e) => setPhoneticText(e.target.value)}
              placeholder="请输入方言的音译，如：来孛/别相"
              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <span className="text-sm text-gray-500">
              请输入方言的音译，如：来孛/别相
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t">
          {uploadError && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
              {uploadError}
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={!isValid || isUploading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold ${
              isValid && !isUploading
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>上传中...</span>
              </>
            ) : (
              <>
                <span>↗️</span>
                <span>上传</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}