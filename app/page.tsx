'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter,
  Send,
  Sparkles,
  MessageSquare,
  Settings,
  Clock,
  AlertTriangle,
  Edit3,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ChevronRight,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 商机数据类型
type Lead = {
  id: number
  name: string
  intentionScore: number
  testDrives: number
  followUpDays: number
  source: string
  cost: number
  sourceType: '自主获取' | '购买'
  targetModel: string
  competitorModel: string
  keyIssue: string
  status: 'active' | 'locked' | 'completed'
  riskLevel?: 'high' | 'medium' | 'low'
  lastContact?: string
  // Delivery phase fields
  financeStatus?: '贷款' | '全款'
  deliveryDays?: number
  deliverySpecialist?: string
}

// 消息类型 - Generative UI结构
type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  // Part A: 内容层
  codeBlock?: string
  // Part B: 主动触发建议
  suggestion?: string
  // Part D: 快捷操作chips
  actionChips?: string[]
}

// 初始商机数据
const initialLeads: Lead[] = [
  {
    id: 1,
    name: '王总',
    intentionScore: 10,
    testDrives: 2,
    followUpDays: 8,
    source: '线下到店',
    cost: 0,
    sourceType: '自主获取',
    targetModel: '理想L7',
    competitorModel: '蔚来ES6',
    keyIssue: '催促提车',
    status: 'active',
    riskLevel: 'low',
    lastContact: '30分钟前'
  },
  {
    id: 2,
    name: '李女士',
    intentionScore: 9,
    testDrives: 3,
    followUpDays: 12,
    source: '老带新',
    cost: 0,
    sourceType: '自主获取',
    targetModel: '理想L6',
    competitorModel: '问界M7',
    keyIssue: '纠结内饰颜色',
    status: 'active',
    riskLevel: 'low',
    lastContact: '1小时前'
  },
  {
    id: 3,
    name: '张先生',
    intentionScore: 7,
    testDrives: 1,
    followUpDays: 3,
    source: '线下到店',
    cost: 0,
    sourceType: '自主获取',
    targetModel: '理想L6',
    competitorModel: '问界M5',
    keyIssue: '对比竞品续航',
    status: 'active',
    riskLevel: 'low',
    lastContact: '3天前'
  },
  {
    id: 4,
    name: '陈小姐',
    intentionScore: 6,
    testDrives: 0,
    followUpDays: 2,
    source: '线上线索',
    cost: 48,
    sourceType: '购买',
    targetModel: '理想L9',
    competitorModel: '宝马X5',
    keyIssue: '询问金融方案',
    status: 'active',
    riskLevel: 'low',
    lastContact: '2天前'
  },
  {
    id: 5,
    name: '赵四',
    intentionScore: 10,
    testDrives: 2,
    followUpDays: 15,
    source: '老客户',
    cost: 0,
    sourceType: '自主获取',
    targetModel: '理想MEGA',
    competitorModel: '腾势D9',
    keyIssue: '等待交付',
    status: 'locked',
    riskLevel: 'low',
    lastContact: '1天前',
    financeStatus: '贷款',
    deliveryDays: 3,
    deliverySpecialist: '刘师傅'
  },
  {
    id: 6,
    name: '钱太',
    intentionScore: 3,
    testDrives: 0,
    followUpDays: 20,
    source: '抖音直播',
    cost: 15,
    sourceType: '购买',
    targetModel: '理想L6',
    competitorModel: '比亚迪唐DM',
    keyIssue: '仅留资',
    status: 'active',
    riskLevel: 'high',
    lastContact: '20天前'
  }
]

export default function AgentWorkbench() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead>(initialLeads[1])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sortBy, setSortBy] = useState<'intention' | 'time' | 'price'>('intention')
  const [pendingTasks, setPendingTasks] = useState(0)

  // 初始化
  useEffect(() => {
    const initialMessage: Message = {
      role: 'assistant',
      content: '检测到客户李女士为高价值目标（意向分9/10，试驾3次），当前纠结内饰颜色选择，建议生成个性化跟进话术：',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `李女士您好！

关于内饰颜色，我特地为您整理了几个推荐方案：

【云境灰】- 商务专业，耐脏易打理，95%客户首选
【晨曦白】- 简约时尚，提升车内亮度，适合女性车主  
【琥珀棕】- 豪华质感，但需定期保养

根据您的使用场景（商务+家用），建议选择云境灰。本周末有现车到店，可以实际体验对比，我帮您预约？`,
      suggestion: '需要我调整话术风格，让语气更温和亲切吗？',
      actionChips: ['直接发送到企微', '调整为激进策略', '查看竞品对比']
    }
    setMessages([initialMessage])
  }, [])

  // 处理用户输入
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Agent智能响应
    setTimeout(() => {
      let agentResponse: Message
      
      if (inputMessage.includes('温和') || inputMessage.includes('调整')) {
        agentResponse = {
          role: 'assistant',
          content: '已调整话术风格为温和亲切版本：',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          codeBlock: `李女士您好呀~

内饰颜色确实需要好好考虑，毕竟每天都要相处😊

我个人比较推荐云境灰，既大气又实用，而且真的很耐脏（这点很重要哈哈）。不过最好的办法还是亲眼看看，周末有现车到店，要不要一起来体验一下？顺便试试不同颜色的实际感觉？`,
          suggestion: '要不要附加一个限时优惠信息，增强紧迫感？',
          actionChips: ['添加优惠信息', '直接发送', '继续优化']
        }
      } else if (inputMessage.includes('优惠')) {
        agentResponse = {
          role: 'assistant',
          content: '已添加限时优惠信息：',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          codeBlock: `另外跟您分享个好消息~

本月购车可享受：
✅ 内饰升级包免费（价值8000元）
✅ 智能驾驶辅助系统半价
✅ 3年免费保养

但这个政策本月底就结束了，名额也只剩最后5个。周末来看车的话，我帮您优先锁定名额？`,
          actionChips: ['发送给李女士', '保存为模板', '查看政策详情']
        }
      } else if (inputMessage.includes('竞品') || inputMessage.includes('对比')) {
        agentResponse = {
          role: 'assistant',
          content: '已生成理想L6 vs 问界M7竞品对比话术：',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          codeBlock: `【核心差异对比】

续航能力：
• 理想L6：纯电180km + 增程，综合1200km
• 问界M7：纯电200km + 增程，综合1100km
→ 理想长途更有优势

空间舒适：
• 理想L6：二排独立座椅，支持电动调节
• 问界M7：二排连排座椅
→ 理想商务属性更强

智能座舱：
• 理想：5屏交互，车内K歌
• 问界：鸿蒙系统，华为生态
→ 看您更看重娱乐还是生态

价格：理想L6起售价33.98万，问界M7起售价31.98万`,
          suggestion: '要不要针对李女士的使用场景，重点突出理想的家庭用车优势？',
          actionChips: ['突出家庭场景', '突出商务场景', '生成试驾邀约']
        }
      } else {
        agentResponse = {
          role: 'assistant',
          content: `已分析${selectedLead.name}的档案：意向分${selectedLead.intentionScore}/10，试驾${selectedLead.testDrives}次，当前${selectedLead.keyIssue}。建议生成针对性话术。`,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actionChips: ['生成话术', '查看跟进历史', '设置提醒']
        }
      }
      
      setMessages(prev => [...prev, agentResponse])
    }, 800)
    
    setInputMessage('')
  }

  // 切换线索
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
    
    let contextMessage: Message = {
      role: 'assistant',
      content: `已切换到${lead.name}（意向分${lead.intentionScore}/10，${lead.keyIssue}）。`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      actionChips: ['生成跟进方案', '查看详情', '设置提醒']
    }
    
    if (lead.riskLevel === 'high') {
      contextMessage = {
        role: 'assistant',
        content: `⚠️ ${lead.name}为高风险客户，${lead.lastContact}未联系，建议立即跟进：`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        codeBlock: `${lead.name}您好！

好久不见，最近看车进展如何？上次聊到您对${lead.targetModel}感兴趣。

最近有个好消息：本月新增了老客户专属优惠，而且现车充足，随时可以安排试驾。

要不要找个时间详细聊聊？我可以帮您做个详细的购车方案对比。`,
        suggestion: '这是一条激活话术，需要调整为更保守的问候方式吗？',
        actionChips: ['直接发送', '调整为保守风格', '标记为无效']
      }
    }
    
    setMessages([contextMessage])
  }

  // 排序
  const sortedLeads = [...leads].sort((a, b) => {
    if (sortBy === 'intention') return b.intentionScore - a.intentionScore
    if (sortBy === 'time') return b.followUpDays - a.followUpDays
    if (sortBy === 'price') return b.cost - a.cost
    return 0
  })

  // 意向分颜色
  const getIntentionColor = (score: number) => {
    if (score >= 8) return 'bg-red-500 text-white'
    if (score >= 6) return 'bg-orange-400 text-white'
    return 'bg-gray-400 text-white'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* iPad Container - Fixed 1024x768 */}
      <div className="w-[1024px] h-[768px] bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden flex">
        
        {/* Left Panel - List View (40%) */}
        <div className="w-[410px] border-r border-gray-200 flex flex-col bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Sales Agent</h1>
                <p className="text-xs text-gray-500 mt-0.5">商机管理</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            
            {/* 警告 */}
            {leads.length < 10 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-700">
                  有效线索{leads.length}条，低于安全阈值≥10条
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="搜索商机..." 
                  className="pl-9 h-9 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 bg-transparent">
                <Filter className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            
            {/* 排序 */}
            <div className="flex gap-1.5">
              <Button 
                variant={sortBy === 'intention' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => setSortBy('intention')}
              >
                意向排序
              </Button>
              <Button 
                variant={sortBy === 'time' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => setSortBy('time')}
              >
                时间排序
              </Button>
              <Button 
                variant={sortBy === 'price' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={() => setSortBy('price')}
              >
                价格排序
              </Button>
            </div>
          </div>

          {/* High-Density List - 3-Layer Vertical Stack with Split View */}
          <div className="flex-1 overflow-y-auto">
            {sortedLeads.filter(lead => lead.status !== 'completed').map((lead, index) => {
              const isUrgent = lead.intentionScore >= 9
              
              return (
                <div
                  key={lead.id}
                  className={cn(
                    "px-4 py-4 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50",
                    selectedLead.id === lead.id && "border-l-4 border-l-blue-500",
                    isUrgent && !selectedLead.id === lead.id && "bg-orange-50/40",
                    lead.riskLevel === 'high' && "bg-red-50/50 border-l-4 border-l-red-400"
                  )}
                  onClick={() => handleLeadClick(lead)}
                >
                  {/* Split Container: Left (3-Layer Stack) | Right (Time + Urgency) */}
                  <div className="flex flex-row justify-between items-start gap-4">
                    
                    {/* Left Column: 3-Layer Info Stack */}
                    <div className="flex-1 space-y-2.5">
                      
                      {/* Layer 1: Market Info (Top) */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{lead.source}</span>
                        <span>·</span>
                        <span>¥{lead.cost}</span>
                        <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 text-[10px] px-1.5 py-0">
                          {lead.sourceType}
                        </Badge>
                      </div>
                      
                      {/* Layer 2: Sales Info (Middle & Prominent) */}
                      <div className="space-y-1.5">
                        {/* Primary: Name + Score Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">{lead.name}</span>
                          <Badge className={cn("text-[11px] px-2 py-0.5", getIntentionColor(lead.intentionScore))}>
                            {lead.intentionScore}分
                          </Badge>
                        </div>
                        
                        {/* Secondary: Stats */}
                        <div className="text-xs text-gray-600">
                          试驾{lead.testDrives}次 · {lead.keyIssue}
                        </div>
                        
                        {/* Visual Tags: Car Models */}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 font-medium">
                            {lead.targetModel}
                          </Badge>
                          <span className="text-xs text-gray-400">vs</span>
                          <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs px-2 py-0.5">
                            {lead.competitorModel}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Layer 3: Delivery Info (Bottom - Conditional) */}
                      {lead.status === 'locked' && lead.financeStatus && (
                        <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                          <span className="flex items-center gap-1">
                            <span className="text-green-600">✓</span>
                            {lead.financeStatus}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span>🚚</span>
                            {lead.deliveryDays}天
                          </span>
                          <span>·</span>
                          <span>{lead.deliverySpecialist}</span>
                        </div>
                      )}
                      
                    </div>
                    
                    {/* Right Column: Time + Urgency Indicator */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="text-xs text-gray-400">
                        {lead.lastContact}
                      </div>
                      {isUrgent && (
                        <Flame className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Panel - Generative AI Interface (60%) */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Minimalist Header */}
          <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {pendingTasks > 0 && (
                <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700 text-xs">
                  {pendingTasks}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-500 hover:text-gray-700" 
              onClick={() => {
                setMessages([])
                setInputMessage('')
              }}
              title="开启新话题"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Conversation Stream - 4-Part Generative UI */}
          <div className="flex-1 overflow-y-auto px-8 py-6" style={{ height: 'calc(100% - 64px - 120px)' }}>
            {messages.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center -mt-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Sales Agent</h3>
                <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
                  从左侧选择客户，我会提供针对性的策略建议
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  <button className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 transition-all">
                    分析今日紧急线索
                  </button>
                  <button className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 transition-all">
                    生成跟进话术
                  </button>
                </div>
              </div>
            ) : (
              /* Conversation Stream */
              <div className="space-y-8 pb-8">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-4">
                    {/* User Message */}
                    {message.role === 'user' && (
                      <div className="pl-1">
                        <div className="text-[15px] leading-relaxed text-gray-800 font-medium">
                          {message.content}
                        </div>
                      </div>
                    )}
                    
                    {/* AI Message - Natural Article Style */}
                    {message.role === 'assistant' && (
                      <div className="space-y-4">
                        {/* Part A: Insight & Solution (Content Layer) */}
                        <div className="prose prose-sm max-w-none">
                          <p className="text-[15px] leading-relaxed text-gray-700">
                            {message.content}
                          </p>
                          
                          {/* Code Block for Script/Content - Plain text style */}
                          {message.codeBlock && (
                            <div className="mt-4 pl-4 border-l-2 border-gray-200 text-[14px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                              {message.codeBlock}
                            </div>
                          )}
                        </div>
                        
                        {/* Part B: Proactive Text Trigger - Plain text style */}
                        {message.suggestion && (
                          <div className="flex items-start gap-2 text-gray-600 italic">
                            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                            <p className="text-[14px] leading-relaxed">
                              {message.suggestion}
                            </p>
                          </div>
                        )}
                        
                        {/* Part C: Feedback Action Bar (RLHF) */}
                        <div className="flex items-center gap-2 pt-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group" title="复制">
                            <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group" title="重新生成">
                            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group" title="赞">
                            <ThumbsUp className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group" title="踩">
                            <ThumbsDown className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group" title="分享">
                            <Share2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                        </div>
                        
                        {/* Part D: Suggested Action Chips */}
                        {message.actionChips && message.actionChips.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {message.actionChips.map((chip, chipIndex) => (
                              <button
                                key={chipIndex}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors"
                                onClick={() => {
                                  setInputMessage(chip)
                                  setTimeout(() => handleSendMessage(), 100)
                                }}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Large Rectangular Input Box */}
          <div className="shrink-0 px-8 pb-6 bg-white">
            <div className="bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-gray-300 focus-within:border-blue-500 transition-colors p-4 flex flex-col gap-3">
              <textarea
                placeholder="在此输入你的问题或指令，支持复杂的自然语言描述..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                rows={3}
                className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-gray-900 placeholder:text-gray-400 leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  按 Enter 发送，Shift + Enter 换行
                </p>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className={cn(
                    "px-6 py-2.5 rounded-xl flex items-center gap-2 font-medium text-sm transition-all",
                    inputMessage.trim() 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                  <span>发送</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
