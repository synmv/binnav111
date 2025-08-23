import { useState, useEffect, useRef } from 'react'
import { Search, Menu, X, Globe, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import WebsiteCard from '../components/WebsiteCard.jsx'
import SubmitWebsiteForm from '../components/SubmitWebsiteForm.jsx'
import { websiteData, categories } from '../websiteData.js'
import { useSiteConfig } from '../hooks/useSiteConfig.js'

// 使用public路径引用logo
const logoImg = '/assets/logo.png'

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const mainContentRef = useRef(null)
  const sectionRefs = useRef({})
  
  // 使用全局站点配置
  const { siteConfig } = useSiteConfig()
  
  // 动态设置页面标题
  useEffect(() => {
    document.title = siteConfig.siteTitle
  }, [siteConfig.siteTitle])

  // 智能搜索功能
  const smartSearch = (query) => {
    if (!query.trim()) return websiteData

    const searchTerms = query.toLowerCase().trim().split(/\s+/)
    
    const synonyms = {
      '设计': ['ui', 'design', '界面', '视觉', '美工'],
      '开发': ['dev', 'coding', '编程', '代码', '程序'],
      '工具': ['tool', '软件', 'app', '应用'],
      '学习': ['教程', 'tutorial', '课程', '教学'],
      '图标': ['icon', 'svg', '矢量', '图形'],
      '配色': ['color', '颜色', '色彩', '调色'],
      '素材': ['资源', 'resource', '模板', 'template'],
      '社区': ['论坛', 'community', '交流', '讨论'],
      '灵感': ['inspiration', '想法', '创意', 'idea']
    }

    return websiteData.filter(website => {
      let relevanceScore = 0
      
      searchTerms.forEach(term => {
        if (website.name.toLowerCase().includes(term)) relevanceScore += 10
        if (website.description.toLowerCase().includes(term)) relevanceScore += 8
        if (website.tags.some(tag => tag.toLowerCase().includes(term))) relevanceScore += 6
        
        Object.entries(synonyms).forEach(([key, values]) => {
          if (term.includes(key) || values.some(v => term.includes(v))) {
            if (website.name.toLowerCase().includes(key)) relevanceScore += 5
            if (website.description.toLowerCase().includes(key)) relevanceScore += 4
            if (website.tags.some(tag => tag.toLowerCase().includes(key))) relevanceScore += 3
            values.forEach(synonym => {
              if (website.name.toLowerCase().includes(synonym)) relevanceScore += 4
              if (website.description.toLowerCase().includes(synonym)) relevanceScore += 3
              if (website.tags.some(tag => tag.toLowerCase().includes(synonym))) relevanceScore += 2
            })
          }
        })
      })
      
      return relevanceScore > 0
    }).sort((a, b) => {
      let scoreA = 0, scoreB = 0
      
      searchTerms.forEach(term => {
        if (a.name.toLowerCase().includes(term)) scoreA += 10
        if (a.description.toLowerCase().includes(term)) scoreA += 8
        if (b.name.toLowerCase().includes(term)) scoreB += 10
        if (b.description.toLowerCase().includes(term)) scoreB += 8
      })
      
      return scoreB - scoreA
    })
  }

  const filteredWebsites = smartSearch(searchTerm)

  // 滚动监听已移除 - 不再显示跟随滚动的选中光圈

  const scrollToCategory = (categoryId) => {
    const sectionElement = sectionRefs.current[categoryId]
    if (sectionElement) {
      const offsetTop = sectionElement.offsetTop - 100
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
    setIsSidebarOpen(false)
  }

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 头部导航 */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={siteConfig.siteLogo}
                  alt="Logo"
                  className="h-8 w-8 rounded-lg shadow-sm"
                  onError={(e) => { e.target.src = logoImg }}
                  key={siteConfig.siteLogo} // 强制重新渲染
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-gray-900 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {siteConfig.siteName}
              </span>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="🔍 站内搜索 - 试试输入'设计工具'或'前端开发'..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden md:flex text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Globe size={16} className="mr-1" />
                中文
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 侧边栏 */}
          <aside className={`lg:w-64 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  网站分类
                </h3>
                <nav className="space-y-1">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => {
                          if (category.subcategories && category.subcategories.length > 0) {
                            toggleCategoryExpansion(category.id)
                          } else {
                            scrollToCategory(category.id)
                          }
                        }}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <div className="flex items-center">
                          <img 
                            src={category.icon} 
                            alt="" 
                            className={`w-5 h-5 mr-3 opacity-80 ${category.special ? 'rounded-full' : ''}`} 
                          />
                          <span className="font-medium">{category.name}</span>
                          {category.special && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full">
                              专栏
                            </span>
                          )}
                        </div>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="ml-2">
                            {expandedCategories[category.id] ? 
                              <ChevronDown size={16} className="text-gray-400" /> : 
                              <ChevronRight size={16} className="text-gray-400" />
                            }
                          </div>
                        )}
                      </button>
                      
                      {category.subcategories && expandedCategories[category.id] && (
                        <div className="ml-4 mt-1 space-y-1">
                          {category.subcategories.map((subcat) => (
                            <button
                              key={subcat.id}
                              onClick={() => scrollToCategory(subcat.id)}
                              className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            >
                              <div className="flex items-center">
                                <img
                                  src={subcat.icon}
                                  alt=""
                                  className={`w-5 h-5 mr-3 opacity-70 ${subcat.special ? 'rounded-full' : ''}`}
                                />
                                <span className="font-medium">{subcat.name}</span>
                                {subcat.special && (
                                  <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full">
                                    专栏
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* 站点服务 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  站点服务
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowSubmitForm(true)}
                    className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group w-full"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 text-sm">📝</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-green-600">站点提交</div>
                      <div className="text-xs text-gray-500">推荐优质网站</div>
                    </div>
                  </button>
                  

                  
                  <a 
                    href="https://github.com/your-username/binnav" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-orange-600 text-sm">ℹ️</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-orange-600">关于导航</div>
                      <div className="text-xs text-gray-500">网站介绍说明</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* 主内容区域 */}
          <main className="flex-1" ref={mainContentRef}>
            <div className="space-y-12">
              {/* 搜索结果 */}
              {searchTerm && (
                <section className="scroll-mt-20">
                  <div className="flex items-center mb-6">
                    <Search className="w-8 h-8 mr-4 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">搜索结果</h2>
                    <span className="ml-4 text-base text-gray-500">找到 {filteredWebsites.length} 个结果</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredWebsites.map((website) => (
                      <WebsiteCard key={website.id} website={website} />
                    ))}
                  </div>
                </section>
              )}

              {/* 分类展示 */}
              {!searchTerm && categories.map((category) => {
                if (category.subcategories && category.subcategories.length > 0) {
                  return (
                    <div key={category.id} className="space-y-12">
                      {category.subcategories.map((subcat) => {
                        const categoryWebsites = websiteData.filter(site => site.category === subcat.id)
                        if (categoryWebsites.length === 0) return null
                        
                        return (
                          <section key={subcat.id} ref={el => sectionRefs.current[subcat.id] = el} className="scroll-mt-20">
                            <div className="flex items-center mb-6">
                              <img
                                src={subcat.icon}
                                alt=""
                                className={`w-8 h-8 mr-4 ${subcat.special ? 'rounded-full ring-2 ring-purple-200' : ''}`}
                              />
                              <h2 className="text-xl font-bold text-gray-900">{subcat.name}</h2>
                              {subcat.special && (
                                <span className="ml-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                                  专栏
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {categoryWebsites.map((website) => (
                                <WebsiteCard key={website.id} website={website} />
                              ))}
                            </div>
                          </section>
                        )
                      })}
                    </div>
                  )
                } else {
                  const categoryWebsites = websiteData.filter(site => site.category === category.id)
                  if (categoryWebsites.length === 0) return null
                  
                  return (
                    <section key={category.id} ref={el => sectionRefs.current[category.id] = el} className="scroll-mt-20">
                      <div className="flex items-center mb-6">
                        <img 
                          src={category.icon} 
                          alt="" 
                          className={`w-8 h-8 mr-4 ${category.special ? 'rounded-full ring-2 ring-purple-200' : ''}`} 
                        />
                        <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                        {category.special && (
                          <span className="ml-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                            专栏
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryWebsites.map((website) => (
                          <WebsiteCard key={website.id} website={website} />
                        ))}
                      </div>
                    </section>
                  )
                }
              })}
            </div>


          </main>
        </div>
      </div>

      {/* 站点提交表单 */}
      <SubmitWebsiteForm 
        isOpen={showSubmitForm} 
        onClose={() => setShowSubmitForm(false)}
        categories={categories}
      />



      {/* 页脚 */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="text-sm text-gray-500 space-y-2">
              {/* 版权信息 */}
              <div>
                <span>© 2025 </span>
                <a
                  href="https://i.bincore.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sindri
                </a>
                <span className="mx-2">·</span>
                <a
                  href="https://github.com/sindricn/BinNav"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  MIT License
                </a>
              </div>

              {/* 备案信息 */}
              {(siteConfig.icpRecord || siteConfig.publicSecurityRecord) && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
                  {siteConfig.icpRecord && (
                    <a
                      href="http://beian.miit.gov.cn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {siteConfig.icpRecord}
                    </a>
                  )}
                  {siteConfig.publicSecurityRecord && (
                    <span>
                      {siteConfig.publicSecurityRecordUrl ? (
                        <a
                          href={siteConfig.publicSecurityRecordUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {siteConfig.publicSecurityRecord}
                        </a>
                      ) : (
                        siteConfig.publicSecurityRecord
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage 