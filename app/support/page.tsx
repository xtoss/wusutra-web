'use client'

import { useState } from 'react'

interface SuggestionType {
  id: string
  label: string
  placeholder: string
  icon: string
}

const suggestionTypes: SuggestionType[] = [
  { 
    id: 'dialect_prompt', 
    label: '方言提示词建议', 
    placeholder: '例如：建议添加"谢谢"的江阴话说法"谢谢侬"',
    icon: '💡'
  },
  { 
    id: 'dialect_option', 
    label: '方言选项建议', 
    placeholder: '例如：建议添加"苏州话"到方言列表',
    icon: '🗣️'
  },
  { 
    id: 'feature', 
    label: '功能建议', 
    placeholder: '例如：建议添加批量录音功能',
    icon: '⚡'
  },
  { 
    id: 'bug', 
    label: '问题反馈', 
    placeholder: '例如：录音按钮有时无响应',
    icon: '🐛'
  },
  { 
    id: 'other', 
    label: '其他建议', 
    placeholder: '任何其他想法或建议...',
    icon: '📝'
  }
]

export default function SupportPage() {
  const [selectedType, setSelectedType] = useState<string>('dialect_prompt')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [showEmailDetails, setShowEmailDetails] = useState(false)
  const [emailDetails, setEmailDetails] = useState({ to: '', subject: '', body: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      alert('请输入您的建议或反馈')
      return
    }

    const typeLabels: { [key: string]: string } = {
      'dialect_prompt': '方言提示词建议',
      'dialect_option': '方言选项建议',
      'feature': '功能建议',
      'bug': '问题反馈',
      'other': '其他建议'
    }

    const typeLabel = typeLabels[selectedType] || '用户反馈'
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    
    // Compose email
    const subject = `[WuSutra] ${typeLabel}`
    const body = `类型: ${typeLabel}
时间: ${timestamp}
${email ? `用户邮箱: ${email}` : ''}

用户建议内容：
${message}

---
此邮件由 WuSutra Web 支持页面发送`

    // Create mailto link
    const mailtoLink = `mailto:jamie.xue@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Try multiple methods to open email client
    try {
      // Method 1: Create a temporary link and click it
      const link = document.createElement('a')
      link.href = mailtoLink
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success message
      setSubmitStatus('success')
      setMessage('')
      setEmail('')
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (error) {
      // Method 2: Fallback to window.open
      try {
        window.open(mailtoLink, '_blank')
        setSubmitStatus('success')
        setMessage('')
        setEmail('')
        setTimeout(() => setSubmitStatus(null), 5000)
      } catch (error2) {
        // Method 3: Last resort - copy email details to clipboard
        const emailDetails = `收件人: jamie.xue@gmail.com\n主题: ${subject}\n\n${body}`
        navigator.clipboard.writeText(emailDetails).then(() => {
          alert('无法自动打开邮件客户端。邮件内容已复制到剪贴板，请手动粘贴到您的邮件应用中。')
          setSubmitStatus('success')
          setMessage('')
          setEmail('')
        }).catch(() => {
          alert('请手动发送邮件到: jamie.xue@gmail.com\n主题: ' + subject)
        })
      }
    }
  }

  const currentType = suggestionTypes.find(t => t.id === selectedType)!

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-center text-gray-900">支持与反馈</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Welcome Message */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🙏</span>
            <h2 className="text-xl font-semibold text-gray-900">感谢您的支持！</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            您的每一条建议都非常宝贵。无论是方言提示词、新方言选项，还是功能改进建议，
            我们都会认真阅读并努力实现。让我们一起让这个平台变得更好！
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">🎙️ 秘密通道：</span> 您还可以通过录音功能给我留言！
              当我看到一段30秒的录音，但翻译只有"你好"两个字时...我就知道您有话要说了 😉
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">留下您的建议</h3>

          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择建议类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {suggestionTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{type.icon}</span>
                    <span className={`font-medium ${
                      selectedType === type.id ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的建议
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={currentType.placeholder}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Email Input (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱 <span className="text-gray-500 text-xs">(选填，方便我们回复您)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>📮</span>
            <span>发送邮件</span>
          </button>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                <span>✅</span>
                <span>正在打开您的邮件客户端，请在邮件中点击发送。</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-800 font-medium mb-2">如果邮件客户端没有自动打开，您可以：</p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong className="text-gray-900">手动发送邮件到：</strong>
                    <a href="mailto:jamie.xue@gmail.com" className="text-blue-600 hover:underline ml-1 font-medium">
                      jamie.xue@gmail.com
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const typeLabels: { [key: string]: string } = {
                        'dialect_prompt': '方言提示词建议',
                        'dialect_option': '方言选项建议',
                        'feature': '功能建议',
                        'bug': '问题反馈',
                        'other': '其他建议'
                      }
                      const subject = `[WuSutra] ${typeLabels[selectedType] || '用户反馈'}`
                      const body = `类型: ${typeLabels[selectedType] || '用户反馈'}
时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
${email ? `用户邮箱: ${email}` : ''}

用户建议内容：
${message}

---
此邮件由 WuSutra Web 支持页面发送`
                      navigator.clipboard.writeText(`收件人: jamie.xue@gmail.com\n主题: ${subject}\n\n${body}`)
                      alert('邮件内容已复制到剪贴板！')
                    }}
                    className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                  >
                    📋 复制邮件内容
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Quick Examples */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6">
          <h4 className="font-medium text-gray-900 mb-3">💡 建议示例</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• "建议添加上海话常用词汇"侬好"、"阿拉"等"</li>
            <li>• "希望能支持温州话的录音"</li>
            <li>• "录音时能否显示倒计时？"</li>
            <li>• "建议增加方言学习功能"</li>
          </ul>
        </div>
      </div>
    </div>
  )
}