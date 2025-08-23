import { useState, useEffect } from 'react'
import { websiteData as initialWebsiteData, categories as initialCategories } from '../websiteData.js'
import { generateConfigFile } from '../utils/configGenerator.js'
import { useSiteConfig } from './useSiteConfig'

/**
 * 管理后台配置管理hook
 */
export const useAdminConfig = () => {
  const [config, setConfig] = useState({
    websiteData: initialWebsiteData,
    categories: initialCategories
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // 显示消息
  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  // 保存配置
  const saveConfig = async () => {
    setIsUpdating(true)
    
    try {
      // 动态获取最新的站点配置
      const currentSiteConfig = JSON.parse(localStorage.getItem('siteConfig') || '{}')

      // 生成配置文件内容，包含站点配置
      const configContent = generateConfigFile(config.websiteData, config.categories, currentSiteConfig)
      
      // 首先获取当前文件的SHA值
      const getResponse = await fetch('/api/get-config')
      if (!getResponse.ok) {
        throw new Error('获取当前配置失败，请刷新页面重试')
      }
      const currentData = await getResponse.json()
      
      if (!currentData.success) {
        throw new Error(currentData.message || '获取当前配置失败')
      }

      if (!currentData.sha) {
        throw new Error('未获取到文件SHA值，无法更新配置')
      }
      
      // 如果返回的是base64内容，给用户一个提示
      if (currentData.contentType === 'base64') {
        showMessage('info', '⚠️ 注意：配置获取可能存在编码问题，但仍可正常保存')
      }
      
      // 调用EdgeOne Functions更新配置
      const updateResponse = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: configContent,
          sha: currentData.sha
        })
      })
      
      const result = await updateResponse.json()
      
      if (result.success) {
        showMessage('success', '✅ 配置保存成功！网站将在几分钟内更新')
      } else {
        throw new Error(result.message || '保存失败')
      }
      
    } catch (error) {
      showMessage('error', `❌ 保存失败：${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  // 更新网站数据
  const updateWebsiteData = (newData) => {
    setConfig(prev => ({
      ...prev,
      websiteData: newData
    }))
  }

  // 更新分类数据
  const updateCategories = (newCategories) => {
    setConfig(prev => ({
      ...prev,
      categories: newCategories
    }))
  }

  return {
    config,
    isUpdating,
    message,
    showMessage,
    saveConfig,
    updateWebsiteData,
    updateCategories
  }
} 
