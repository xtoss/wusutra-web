'use client'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-center text-gray-900">排行榜</h1>
      </div>

      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">排行榜</h2>
        <p className="text-gray-600">查看贡献者排名和统计</p>
      </div>
    </div>
  )
}