export async function convertWebMToWav(webmBlob: Blob): Promise<Blob> {
  // Create audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  // Decode the WebM audio
  const arrayBuffer = await webmBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  
  // Get audio data
  const numberOfChannels = audioBuffer.numberOfChannels
  const length = audioBuffer.length * numberOfChannels * 2 + 44
  const buffer = new ArrayBuffer(length)
  const view = new DataView(buffer)
  const channels = []
  const sampleRate = audioBuffer.sampleRate
  
  // Extract channel data
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i))
  }
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  let offset = 0
  
  // RIFF chunk descriptor
  writeString(offset, 'RIFF'); offset += 4
  view.setUint32(offset, length - 8, true); offset += 4
  writeString(offset, 'WAVE'); offset += 4
  
  // FMT sub-chunk
  writeString(offset, 'fmt '); offset += 4
  view.setUint32(offset, 16, true); offset += 4 // Subchunk1Size
  view.setUint16(offset, 1, true); offset += 2 // AudioFormat (PCM)
  view.setUint16(offset, numberOfChannels, true); offset += 2
  view.setUint32(offset, sampleRate, true); offset += 4
  view.setUint32(offset, sampleRate * numberOfChannels * 2, true); offset += 4 // ByteRate
  view.setUint16(offset, numberOfChannels * 2, true); offset += 2 // BlockAlign
  view.setUint16(offset, 16, true); offset += 2 // BitsPerSample
  
  // Data sub-chunk
  writeString(offset, 'data'); offset += 4
  view.setUint32(offset, length - offset - 4, true); offset += 4
  
  // Write interleaved samples
  const volume = 1
  let index = 0
  
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      let sample = channels[channel][i] * volume
      sample = Math.max(-1, Math.min(1, sample)) // Clamp
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF // Convert to 16-bit PCM
      view.setInt16(offset, sample, true)
      offset += 2
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' })
}