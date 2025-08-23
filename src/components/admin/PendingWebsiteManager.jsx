import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, Mail, Globe, Tag, Calendar, User, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button.jsx'

const PendingWebsiteManager = () => {
  const [pendingWebsites, setPendingWebsites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 加载待审核网站数据
  const loadPendingWebsites = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 使用fetch从public目录读取JSON文件，避免ES模块导入问题
      const response = await fetch('/pending-websites.json')
      if (response.ok) {
        const data = await response.json()
        setPendingWebsites(Array.isArray(data) ? data : [])
      } else {
        // 如果文件不存在或读取失败，使用空数组
        setPendingWebsites([])
      }
    } catch (error) {
      console.warn('加载待审核网站数据失败，使用空数组:', error)
      // 不显示错误，因为文件可能还不存在
      setPendingWebsites([])
    } finally {
      setIsLoading(false)
    }
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadPendingWebsites()
  }, [])

  // 刷新待审核网站数据（重新获取文件）
  const refreshPendingWebsites = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 添加时间戳避免缓存
      const response = await fetch('/pending-websites.json?t=' + Date.now())
      if (response.ok) {
        const data = await response.json()
        setPendingWebsites(Array.isArray(data) ? data : [])
      } else {
        setPendingWebsites([])
      }
    } catch (error) {
      console.warn('刷新待审核网站数据失败:', error)
      setPendingWebsites([])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理审核操作
  const handleApprove = async (website) => {
    if (!confirm(`确定要通过审核 "${website.name}" 吗？`)) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-website-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          websiteId: website.id,
          action: 'approve'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('审核通过成功！网站已添加到导航中。')
        // 刷新待审核列表
        await refreshPendingWebsites()
      } else {
        throw new Error(result.message || '审核处理失败')
      }
    } catch (error) {
      console.error('审核处理失败:', error)
      alert('审核处理失败：' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (website) => {
    const reason = prompt('请输入拒绝理由（可选）：')
    if (reason === null) return // 用户取消

    setIsProcessing(true)
    try {
      const response = await fetch('/api/process-website-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          websiteId: website.id,
          action: 'reject',
          rejectReason: reason || '不符合收录标准'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('审核拒绝成功！已发送通知邮件给提交者。')
        // 刷新待审核列表
        await refreshPendingWebsites()
      } else {
        throw new Error(result.message || '审核处理失败')
      }
    } catch (error) {
      console.error('审核处理失败:', error)
      alert('审核处理失败：' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-50 text-blue-700'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '待审核'
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return '未知状态'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          正在加载待审核网站...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">加载失败</span>
        </div>
        <p className="text-red-700">{error}</p>
        <Button 
          onClick={refreshPendingWebsites}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            待审核网站 ({pendingWebsites.length})
          </h2>
        </div>
        <Button 
          onClick={refreshPendingWebsites}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 网站列表 */}
      {pendingWebsites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>暂无待审核的网站</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingWebsites.map((website) => (
            <div
              key={website.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {website.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(website.status)}`}>
                      {getStatusText(website.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {website.url}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-600">{website.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        分类: {website.category}
                        {website.tags && ` | 标签: ${website.tags}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {website.contactEmail}
                        {website.submitterName && ` (${website.submitterName})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        提交时间: {formatDate(website.submittedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 ml-4">
                  {website.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(website)}
                        disabled={isProcessing}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        通过
                      </Button>
                      <Button
                        onClick={() => handleReject(website)}
                        disabled={isProcessing}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        拒绝
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PendingWebsiteManager 