'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL, TRAINING_API_URL } from '@/lib/config'

interface TrainingStatus {
  status: string
  data?: {
    last_training: string | null
    total_trainings: number
    pending_files: number
    threshold: number
    total_audio_files: number
    processed_files: number
  }
}

interface TrainingResponse {
  status: string
  message: string
  mode?: string
  note?: string
}

interface DialectProgress {
  id: string
  dialectName: string
  count: number
  currentModel: string
}

export default function TrainingPage() {
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showManualTraining, setShowManualTraining] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'incremental' | 'full' | 'lora'>('lora')
  const [isTraining, setIsTraining] = useState(false)
  const [trainingMessage, setTrainingMessage] = useState('')
  const [showTrainingAlert, setShowTrainingAlert] = useState(false)
  const [countdownTime, setCountdownTime] = useState(0)

  // Mock dialect progress
  const [dialectProgress] = useState<DialectProgress[]>([
    { id: '1', dialectName: '江阴话', count: 250, currentModel: 'whisper_finetuned_output_20250909' },
    { id: '2', dialectName: '普通话', count: 180, currentModel: 'whisper-small-base' }
  ])

  useEffect(() => {
    fetchTrainingStatus()
    // Mock countdown - 1 day 22 hours 52 minutes
    setCountdownTime(1 * 24 * 60 * 60 + 22 * 60 * 60 + 52 * 60)
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdownTime(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchTrainingStatus = async () => {
    try {
      const response = await fetch(TRAINING_API_URL)
      if (response.ok) {
        const data = await response.json()
        setTrainingStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch training status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const triggerManualTraining = async () => {
    setIsTraining(true)
    setTrainingMessage('')

    try {
      const response = await fetch(`${TRAINING_API_URL}?mode=${selectedMode}`, {
        method: 'POST'
      })

      const data: TrainingResponse = await response.json()
      
      if (response.ok) {
        setTrainingMessage(data.note ? `${data.message}\n\n${data.note}` : data.message)
      } else {
        setTrainingMessage(data.message || '训练启动失败')
      }
      
      setShowTrainingAlert(true)
      setShowManualTraining(false)
      
    } catch (error) {
      setTrainingMessage(error instanceof Error ? error.message : '无法连接到服务器')
      setShowTrainingAlert(true)
    } finally {
      setIsTraining(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    return `${days}天 ${hours}小时\n${minutes}分钟`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-center text-gray-900">训练中心</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Robot Icon & Title */}
        <div className="text-center space-y-4">
          <div className="text-8xl">🤖</div>
          <h2 className="text-3xl font-bold text-gray-900">无言引擎训练中心</h2>
          <p className="text-gray-600 px-8">
            您的每一次录音，都在塑造更智能的方言之声。
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            为什么您的贡献如此重要？
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            主流AI能听懂普通话、粤语，但很少能识别您家乡独特的方言。您的每一次录音，都在为创建一个全新的、属于您家乡的语言模型添砖加瓦。这是从0到1的创造，每一条都至关重要。
          </p>

          <hr className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <span className="text-sm">ℹ️</span>
              <span className="text-sm font-medium">训练模式</span>
            </div>
            <p className="text-sm text-gray-600">
              当前训练模式：从基础 Whisper 模型开始训练
            </p>
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
              <span className="text-sm">⚠️</span>
              <span className="text-sm font-medium">注意：手动训练只会使用未处理的新录音</span>
            </div>
            <p className="text-xs text-gray-500">
              系统会记录已训练的文件，下次训练只包含新增的录音文件。
            </p>
          </div>
        </div>

        {/* Countdown Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">⏳</span>
            <span className="text-lg font-semibold">全局周期训练倒计时</span>
          </div>

          <div className="text-center space-y-6">
            <div className="text-4xl font-bold text-green-600 font-mono whitespace-pre-line">
              {formatCountdown(countdownTime)}
            </div>
            
            <button
              onClick={() => setShowManualTraining(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-full hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="text-2xl">▶️</span>
              <span>手动训练</span>
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            <span className="text-lg font-semibold">各方言数据累积进度</span>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            每个方言累积500条新录音即可触发一次专门训练。
          </p>

          <div className="space-y-6">
            {dialectProgress.map((progress) => (
              <div key={progress.id}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">{progress.dialectName}</span>
                  <span className="text-sm text-gray-600">{progress.count} / 500 条新录音</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-blue-600">🖥️</span>
                  <span className="text-xs text-blue-600">当前模型: {progress.currentModel}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((progress.count / 500) * 100, 100)}%` }}
                  />
                </div>

                {progress.count < 500 && (
                  <p className="text-xs text-orange-600 mt-1">
                    还需要 {500 - progress.count} 条录音即可启动训练
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Training Status */}
        {trainingStatus?.data && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-medium mb-2">训练状态</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>待处理文件: {trainingStatus.data.pending_files}</p>
              <p>总训练次数: {trainingStatus.data.total_trainings}</p>
              <p>总文件数: {trainingStatus.data.total_audio_files}</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Training Modal */}
      {showManualTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">选择训练模式</h3>
              <p className="text-gray-500 text-sm">请选择您想要的训练方式</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedMode('lora')}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedMode === 'lora' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedMode === 'lora' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMode === 'lora' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600">LoRA 训练 (推荐)</div>
                    <div className="text-sm text-gray-600">高效适配器训练，模型更小</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('incremental')}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedMode === 'incremental' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedMode === 'incremental' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMode === 'incremental' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">增量训练</div>
                    <div className="text-sm text-gray-600">只训练新增的音频文件</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('full')}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  selectedMode === 'full' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedMode === 'full' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMode === 'full' && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">完整训练</div>
                    <div className="text-sm text-gray-600">训练所有音频文件</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={triggerManualTraining}
                disabled={isTraining}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors"
              >
                {isTraining ? '启动中...' : '开始训练'}
              </button>
              <button
                onClick={() => setShowManualTraining(false)}
                className="w-full py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training Alert */}
      {showTrainingAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">训练结果</h3>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{trainingMessage}</p>
            <button
              onClick={() => setShowTrainingAlert(false)}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  )
}