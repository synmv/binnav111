import React from 'react'

/**
 * 网站表单组件
 */
const WebsiteForm = ({
  websiteForm,
  setWebsiteForm,
  onSave,
  onCancel,
  isEditing = false,
  categories = [] // 添加分类数据
}) => {
  return (
    <div className={`border rounded-lg p-6 mb-6 ${
      isEditing ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
    }`}>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? '编辑网站' : '添加新网站'}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
          <input
            type="text"
            value={websiteForm.name}
            onChange={(e) => setWebsiteForm({...websiteForm, name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如：GitHub"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">网站地址</label>
          <input
            type="url"
            value={websiteForm.url}
            onChange={(e) => setWebsiteForm({...websiteForm, url: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://github.com"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">网站描述</label>
          <textarea
            value={websiteForm.description}
            onChange={(e) => setWebsiteForm({...websiteForm, description: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="简要描述网站的功能和特色..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">所属分类</label>
          <select
            value={websiteForm.category}
            onChange={(e) => setWebsiteForm({...websiteForm, category: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择分类</option>
            {categories.map(category => (
              <optgroup key={category.id} label={category.name}>
                <option value={category.id}>{category.name}</option>
                {category.subcategories && category.subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    　└ {subcategory.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签 (用逗号分隔)</label>
          <input
            type="text"
            value={websiteForm.tags}
            onChange={(e) => setWebsiteForm({...websiteForm, tags: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="设计, 工具, 免费"
          />
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onSave}
          className={`px-6 py-2 rounded-lg flex-1 text-white ${
            isEditing 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          保存网站
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex-1"
        >
          取消
        </button>
      </div>
    </div>
  )
}

export default WebsiteForm 