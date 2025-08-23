import React from 'react'
import { User, LogOut, Save } from 'lucide-react'

/**
 * 用户头部组件
 */
const UserHeader = ({ isUpdating, onSave, onLogout }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">管理后台</h1>
            <p className="text-sm text-gray-500">网站配置管理系统</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onSave}
            disabled={isUpdating}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? '保存中...' : '保存配置'}</span>
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span>退出</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserHeader 