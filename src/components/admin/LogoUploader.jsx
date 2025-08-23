import React, { useState } from 'react'
import { Upload, X, Image } from 'lucide-react'

const LogoUploader = ({ 
  currentLogo, 
  onLogoUpdate, 
  onClose, 
  showMessage 
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', '仅支持PNG、JPG、GIF、SVG格式的图片')
      return
    }

    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', '图片大小不能超过2MB')
      return
    }

    setIsUploading(true)

    try {
      // 读取文件为base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Content = e.target.result
          setPreviewUrl(base64Content) // 设置预览

          // 调用EdgeOne Functions上传Logo，固定文件名为logo.png
          const response = await fetch('/api/upload-icon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileName: 'logo.png', // 固定文件名
              fileContent: base64Content,
              fileType: file.type
            })
          })

          const result = await response.json()

          if (result.success) {
            onLogoUpdate('/assets/logo.png') // 固定路径
            showMessage('success', '站点Logo更新成功！')
            setTimeout(() => {
              onClose()
            }, 1500)
          } else {
            showMessage('error', result.message || '上传失败')
            setPreviewUrl(null)
          }
        } catch (error) {
          showMessage('error', '上传失败：' + error.message)
          setPreviewUrl(null)
        } finally {
          setIsUploading(false)
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      showMessage('error', '读取文件失败：' + error.message)
      setIsUploading(false)
    }

    // 清空input值，允许重复上传同一文件
    event.target.value = ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">更换站点Logo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {/* 当前Logo显示 */}
          <div className="mb-6 text-center">
            <div className="w-24 h-24 mx-auto mb-3 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
              <img 
                src={previewUrl || currentLogo} 
                alt="当前Logo"
                className="max-w-full max-h-full object-contain"
                onError={(e) => { e.target.src = '/assets/logo.png' }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {previewUrl ? '预览新Logo' : '当前Logo'}
            </p>
          </div>

          {/* 上传区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="logo-upload"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="logo-upload"
              className={`cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                ) : (
                  <Upload className="h-8 w-8 text-gray-400 mb-3" />
                )}
                <p className="text-sm text-gray-600 mb-1">
                  {isUploading ? '正在上传...' : '点击选择新Logo'}
                </p>
                <p className="text-xs text-gray-500">
                  支持PNG、JPG、GIF、SVG格式，大小不超过2MB
                </p>
              </div>
            </label>
          </div>

          {/* 说明 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>注意：</strong>新Logo将覆盖现有的logo.png文件，更新后1-2分钟生效。
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm transition-colors disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoUploader 