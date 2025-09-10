'use client'

export default function MorePage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-center text-gray-900">更多</h1>
      </div>

      <div className="p-6 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">更多功能</h2>
        <p className="text-gray-600">设置和其他功能</p>
      </div>
    </div>
  )
}