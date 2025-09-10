'use client'

import { useState, useRef, useEffect } from 'react'

interface AudioPlayerProps {
  audioBlob: Blob
  duration: number
}

export default function AudioPlayer({ audioBlob, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob)
    setAudioUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [audioBlob])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePlayPause}
        className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
      >
        <span className="text-xl">{isPlaying ? '⏸' : '▶'}</span>
      </button>

      <div className="flex-1">
        <div className="relative h-8 flex items-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Waveform visualization placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 mx-0.5 bg-gray-400 rounded-full"
                style={{ height: `${Math.random() * 20 + 10}px` }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}
    </div>
  )
}