'use client'

import { useState, useRef, useEffect } from 'react'
import { RecordingItem, dialects } from '@/types'
import { jiangYinPrompts } from '@/utils/prompts'
import TranslationModal from '@/components/TranslationModal'
import { recordingStorage } from '@/lib/storage'

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedDialect, setSelectedDialect] = useState('jiangyin')
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPromptPhonetic, setSelectedPromptPhonetic] = useState('')
  const [selectedPromptText, setSelectedPromptText] = useState('')
  const [currentRecording, setCurrentRecording] = useState<RecordingItem | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkPermission()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const checkPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch (err) {
      setHasPermission(false)
      setPermissionDenied(true)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const tenths = Math.floor((time * 10) % 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Generate filename with timestamp format matching iOS
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        const filename = `${year}${month}${day}-${hours}${minutes}${seconds}.webm`
        
        const recording: RecordingItem = {
          id: Date.now().toString(),
          filename,
          duration: recordingTime,
          createdAt: now,
          text: selectedPromptText,
          dialect: selectedDialect,
          phoneticTranscription: selectedPromptPhonetic,
          status: 'pending',
          uploadAttempts: 0,
          userId: 'web-user',
          blob
        }
        
        // Save to local storage and wait for it to complete
        try {
          if (!recording.blob) {
            throw new Error('Recording blob is missing')
          }
          
          await recordingStorage.saveRecording({
            id: recording.id,
            filename: recording.filename,
            blob: recording.blob,
            duration: recording.duration,
            createdAt: recording.createdAt,
            text: recording.text || '',
            dialect: recording.dialect,
            phoneticTranscription: recording.phoneticTranscription || '',
            uploadStatus: 'pending' as const
          })
          
          // Only show modal after successful save
          setCurrentRecording(recording)
          setCurrentStep(3)
          setShowTranslationModal(true)
        } catch (err) {
          console.error('Failed to save recording:', err)
          alert('录音保存失败')
        }
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 0.1)
      }, 100)
      
    } catch (err) {
      console.error('Failed to start recording:', err)
      alert('无法启动录音，请检查麦克风权限')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePrompt = (prompt: typeof jiangYinPrompts[0]) => {
    if (selectedPromptPhonetic === prompt.phonetic) {
      setSelectedPromptPhonetic('')
      setSelectedPromptText('')
    } else {
      setSelectedPromptPhonetic(prompt.phonetic)
      setSelectedPromptText(prompt.text)
    }
  }

  const handleSubmitRecording = async (text: string, phoneticText: string) => {
    if (currentRecording) {
      // Update the recording with final text values
      try {
        await recordingStorage.updateRecording(currentRecording.id, {
          text,
          phoneticTranscription: phoneticText
        })
        
        console.log('Recording updated with text:', currentRecording.id)
      } catch (error) {
        console.error('Failed to update recording:', error)
        alert('更新录音失败')
      }
      
      // Reset form
      setCurrentRecording(null)
      setCurrentStep(1)
      setSelectedPromptText('')
      setSelectedPromptPhonetic('')
    }
  }

  if (permissionDenied) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-red-500 text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-semibold">需要麦克风权限</h2>
          <p className="text-gray-400">请在浏览器设置中允许麦克风访问以录制音频</p>
          <button 
            onClick={checkPermission}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
          >
            重新检查权限
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-gray-900 p-4">
        <h1 className="text-xl font-semibold text-center">录音</h1>
      </div>

      {/* Task description */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-blue-400 text-3xl">🎯</span>
          <span className="text-2xl font-bold">您的任务：帮助训练方言AI模型</span>
        </div>
        <div className="flex gap-4 text-lg font-medium">
          <span className={`flex items-center gap-2 ${currentStep === 1 ? 'text-blue-400' : 'text-gray-500'}`}>
            <span className="bg-blue-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">1</span>
            选择方言
          </span>
          <span className={`flex items-center gap-2 ${currentStep === 2 ? 'text-blue-400' : 'text-gray-500'}`}>
            <span className="bg-blue-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">2</span>
            录制语音
          </span>
          <span className={`flex items-center gap-2 ${currentStep === 3 ? 'text-blue-400' : 'text-gray-500'}`}>
            <span className="bg-blue-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">3</span>
            输入文字
          </span>
          <span className={`flex items-center gap-2 ${currentStep === 4 ? 'text-blue-400' : 'text-gray-500'}`}>
            <span className="bg-gray-500 text-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">4</span>
            音译(选填)
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Step 1: Dialect Selection */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold">1</span>
            <span className="text-lg font-semibold">选择方言</span>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={selectedDialect} 
              onChange={(e) => {
                setSelectedDialect(e.target.value)
                setCurrentStep(2)
              }}
              className="flex-1 bg-gray-700 text-white p-2 rounded"
            >
              {dialects.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
            <span className="text-green-500">✓</span>
          </div>
        </div>

        {/* Prompts */}
        {selectedDialect === 'jiangyin' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400">💡</span>
              <span className="text-lg font-semibold">录音建议</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {jiangYinPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => togglePrompt(prompt)}
                  className={`text-left p-3 rounded text-sm transition-colors ${
                    selectedPromptPhonetic === prompt.phonetic 
                      ? 'bg-blue-600 border-2 border-blue-400' 
                      : 'bg-blue-900'
                  }`}
                >
                  <div className="font-semibold">{prompt.phonetic}</div>
                  <div className="text-xs opacity-80">——{prompt.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Recording */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold">2</span>
              <span className="text-lg font-semibold">录制语音</span>
            </div>
            {isRecording && (
              <span className="text-red-500 font-mono text-lg">{formatTime(recordingTime)}</span>
            )}
          </div>
          <div className="flex justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!hasPermission}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
              } disabled:bg-gray-600`}
            >
              <span className="text-3xl">{isRecording ? '⏹' : '🎤'}</span>
            </button>
          </div>
        </div>

        {/* Step 3: Text Input */}
        <div className={`bg-gray-800 rounded-lg p-4 ${!selectedPromptText ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`${selectedPromptText ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-full w-7 h-7 flex items-center justify-center font-bold`}>3</span>
              <span className="text-lg font-semibold">输入正确文字</span>
            </div>
            {selectedPromptText && <span className="text-green-500">✓</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${selectedPromptText ? 'text-green-500' : 'text-gray-500'}`}>📄</span>
            {selectedPromptText ? (
              <div>
                <div className="text-green-500 text-sm">已预填文字</div>
                <div className="font-medium">{selectedPromptText}</div>
              </div>
            ) : (
              <div className="text-gray-500">请先完成录音</div>
            )}
          </div>
        </div>

        {/* Step 4: Phonetic */}
        <div className={`bg-gray-800 rounded-lg p-4 ${!selectedPromptPhonetic ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`${selectedPromptPhonetic ? 'bg-green-500' : 'bg-blue-600'} text-white rounded-full w-7 h-7 flex items-center justify-center font-bold`}>4</span>
              <span className="text-lg font-semibold">音译 (选填)</span>
            </div>
            {selectedPromptPhonetic ? (
              <span className="text-green-500">✓</span>
            ) : (
              <span className="text-blue-500 text-xs bg-blue-900 px-2 py-1 rounded">选填</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${selectedPromptPhonetic ? 'text-green-500' : 'text-blue-600'}`}>🔤</span>
            {selectedPromptPhonetic ? (
              <div>
                <div className="text-green-500 text-sm">已预填音译</div>
                <div className="font-medium">{selectedPromptPhonetic}</div>
              </div>
            ) : (
              <div>
                <div className="text-gray-400">添加方言音译</div>
                <div className="text-gray-500 text-sm">如：来孛/别相 → 来玩</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Translation Modal */}
      {currentRecording && (
        <TranslationModal
          recording={currentRecording}
          isOpen={showTranslationModal}
          onClose={() => setShowTranslationModal(false)}
          onSubmit={handleSubmitRecording}
        />
      )}
    </div>
  )
}