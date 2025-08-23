import React from 'react'
import { Globe, Tag, Settings, Clock } from 'lucide-react'

/**
 * 标签页导航组件
 */
const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'websites', name: '网站管理', icon: Globe },
    { id: 'pending', name: '待审核站点', icon: Clock },
    { id: 'categories', name: '分类管理', icon: Tag },
    { id: 'settings', name: '系统设置', icon: Settings }
  ]

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default TabNavigation 