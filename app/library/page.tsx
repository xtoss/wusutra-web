'use client'

import { useState, useEffect } from 'react'
import { recordingStorage, LocalRecording } from '@/lib/storage'
import AudioPlayer from '@/components/AudioPlayer'

export default function LibraryPage() {
  const [recordings, setRecordings] = useState<LocalRecording[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null)
  const [showTextModal, setShowTextModal] = useState(false)
  const [editingRecording, setEditingRecording] = useState<LocalRecording | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    loadRecordings()
  }, [])

  const loadRecordings = async () => {
    try {
      const allRecordings = await recordingStorage.getAllRecordings()
      setRecordings(allRecordings)
    } catch (error) {
      console.error('Failed to load recordings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个录音吗？')) {
      try {
        await recordingStorage.deleteRecording(id)
        await loadRecordings()
      } catch (error) {
        console.error('Failed to delete recording:', error)
        alert('删除失败')
      }
    }
  }

  const handleAddText = (recording: LocalRecording) => {
    setEditingRecording(recording)
    setEditText(recording.text || '')
    setShowTextModal(true)
  }

  const saveText = async () => {
    if (!editingRecording) return

    try {
      await recordingStorage.updateRecording(editingRecording.id, {
        text: editText.trim()
      })
      await loadRecordings()
      setShowTextModal(false)
      setEditingRecording(null)
      setEditText('')
    } catch (error) {
      console.error('Failed to update text:', error)
      alert('保存失败')
    }
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
  }

  const getStatusBadge = (status: LocalRecording['uploadStatus']) => {
    switch (status) {
      case 'uploaded':
        return <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">待审核</span>
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">待上传</span>
      case 'failed':
        return <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">上传失败</span>
    }
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
        <h1 className="text-xl font-semibold text-center text-gray-900">录音库</h1>
      </div>

      {recordings.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">暂无录音</h2>
          <p className="text-gray-600">快去录制您的第一段方言吧！</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-white rounded-lg p-4 shadow-sm">
              {/* Filename */}
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                {recording.filename}
              </h3>
              
              {/* Recording Info */}
              <div className="mb-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>🕐</span>
                    <span>{formatDate(recording.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>📅</span>
                    <span>{new Date(recording.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    {recording.dialect}
                  </span>
                  {getStatusBadge(recording.uploadStatus)}
                </div>
                {recording.text && (
                  <div className="mt-2 text-gray-700">
                    <span className="font-medium">文字：</span>{recording.text}
                  </div>
                )}
              </div>

              {/* Audio Player */}
              <AudioPlayer 
                audioBlob={recording.blob} 
                duration={recording.duration}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAddText(recording)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <span className="mr-1">✏️</span>
                  添加文字
                </button>
                <button
                  onClick={() => handleDelete(recording.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <span className="mr-1">🗑️</span>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Text Edit Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">编辑录音文字</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="请输入录音内容的文字..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveText}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowTextModal(false)
                  setEditingRecording(null)
                  setEditText('')
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}