'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { 
  Search, 
  Filter,
  Flame,
  Send,
  Sparkles,
  FileText,
  ShoppingCart,
  Truck,
  MessageSquare,
  ChevronDown,
  Settings,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ArrowUpDown
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
  financeStatus?: '贷款' | '全款' | null
  deliveryDays?: number | null
  deliverySpecialist?: string | null
  lastContact?: string
}

// 消息类型
type Message = {
  role: 'user' | 'assistant'
  content: string
  editable?: boolean
  timestamp: string
  actions?: Array<{
    label: string
    type: 'primary' | 'secondary'
    onClick?: () => void
  }>
}

// 初始商机数据 - 8条线索覆盖Market/Sales/Delivery各场景
const initialLeads: Lead[] = [
  // High Intention - Sales Agent (Urgent)
  {
    id: 1,
    name: '客户王总',
    intentionScore: 10,
    testDrives: 2,
    followUpDays: 8,
    source: '线下到店',
    cost: 0,
    sourceType: '自主获取',
    targetModel: '智己L7',
    competitorModel: '蔚来ET7',
    keyIssue: '催促提车',
    status: 'active',
    riskLevel: 'low',
    lastContact: '30分钟前'
  },
  {
    id: 2,
    name: '客户李女士',
    intentionScore: 9,
    testDrives: 3,
    followUpDays: 12,
    source: '老带新',
    cost: 0,
    sourceType: '自主获取',
    targetModel: 'LS6',
    competitorModel: '特斯拉 Model Y',
    keyIssue: '纠结内饰颜色',
    status: 'active',
    riskLevel: 'low',
    lastContact: '1小时前'
  },
  // Mid Intention - Sales Agent (Nurturing)
  {
    id: 3,
    name: '客户张先生',
    intentionScore: 7,
    testDrives: 1,
    followUpDays: 3,
    source: '线下到店',
    cost: 0,
    sourceType: '自主获取',
    targetModel: 'LS6',
    competitorModel: '小鹏G6',
    keyIssue: '对比竞品续航',
    status: 'active',
    riskLevel: 'low',
    lastContact: '3天前'
  },
  {
    id: 4,
    name: '客户陈小姐',
    intentionScore: 6,
    testDrives: 0,
    followUpDays: 2,
    source: '线上线索',
    cost: 48,
    sourceType: '购买',
    targetModel: 'ES6',
    competitorModel: '理想L6',
    keyIssue: '询问金融方案',
    status: 'active',
    riskLevel: 'low',
    lastContact: '2天前'
  },
  // Delivery Phase - Delivery Agent
  {
    id: 5,
    name: '客户赵四',
    intentionScore: 10,
    testDrives: 2,
    followUpDays: 15,
    source: '老客户',
    cost: 0,
    sourceType: '自主获取',
    targetModel: 'ET7',
    competitorModel: '宝马5系',
    keyIssue: '等待交付',
    status: 'locked',
    riskLevel: 'low',
    financeStatus: '贷款',
    deliveryDays: 3,
    deliverySpecialist: '刘能',
    lastContact: '1天前'
  },
  {
    id: 6,
    name: '客户钱太',
    intentionScore: 10,
    testDrives: 1,
    followUpDays: 18,
    source: '线下到店',
    cost: 0,
    sourceType: '自主获取',
    targetModel: 'ES8',
    competitorModel: '奥迪Q7',
    keyIssue: '待验车',
    status: 'locked',
    riskLevel: 'low',
    financeStatus: '全款',
    deliveryDays: 0,
    deliverySpecialist: '谢广坤',
    lastContact: '刚刚'
  },
  // Low Intention - Market Agent (Long Tail)
  {
    id: 7,
    name: '客户孙某',
    intentionScore: 3,
    testDrives: 0,
    followUpDays: 20,
    source: '抖音直播',
    cost: 15,
    sourceType: '购买',
    targetModel: 'LS6',
    competitorModel: '比亚迪海豹',
    keyIssue: '仅留资',
    status: 'active',
    riskLevel: 'high',
    lastContact: '20天前'
  },
  {
    id: 8,
    name: '客户周某',
    intentionScore: 2,
    testDrives: 0,
    followUpDays: 35,
    source: '老客户推荐',
    cost: 0,
    sourceType: '自主获取',
    targetModel: 'ES6',
    competitorModel: '小鹏P7',
    keyIssue: '战败激活',
    status: 'active',
    riskLevel: 'high',
    lastContact: '35天前'
  }
]

export default function AgentWorkbench() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead>(initialLeads[1]) // 默认选中客户李女士
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sortBy, setSortBy] = useState<'intention' | 'time' | 'price'>('intention')
  const [showSkillConfig, setShowSkillConfig] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const [pendingTasks, setPendingTasks] = useState<Array<{ id: number; title: string; priority: number }>>([])

  // 初始化 - 市场Agent自动触发（线索不足）
  useEffect(() => {
    const initialMessage: Message = {
      role: 'assistant',
      content: '早上好！当前有效线索8条，系统检测到2条高风险线索（客户孙某、客户周某），需要优先处理。\n\n同时，客户李女士为高价值客户（意向分9分，试驾3次），当前纠结内饰颜色，建议生成跟进话术。',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '生成话术', type: 'primary' },
        { label: '查看高风险线索', type: 'secondary' }
      ]
    }
    setMessages([initialMessage])
  }, [])

  // 当选中客户B时，销售Agent自动触发
  useEffect(() => {
    if (selectedLead.id === 2 && messages.length === 1) {
      setTimeout(() => {
        const salesAgentMessage: Message = {
          role: 'assistant',
          content: '客户B为高价值客户（意向分9分，试驾2次，跟进15天），当前纠结竞品续航。需要生成跟进话术吗？',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '生成话术', type: 'primary' },
            { label: '暂不需要', type: 'secondary' }
          ]
        }
        setMessages(prev => [...prev, salesAgentMessage])
      }, 1000)
    }
  }, [selectedLead.id, messages.length])

  // 客户C锁单后，交付Agent自动触发
  useEffect(() => {
    if (selectedLead.id === 3 && selectedLead.status === 'locked' && messages.length === 1) {
      setTimeout(() => {
        const deliveryAgentMessage: Message = {
          role: 'assistant',
          content: '客户C已锁单，需办理贷款，交付周期7天。已自动拉群，要不要提醒跟进贷款资料提交？',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '需要', type: 'primary' },
            { label: '暂不需要', type: 'secondary' }
          ]
        }
        setMessages([deliveryAgentMessage])
      }, 500)
    }
  }, [selectedLead.id, selectedLead.status, messages.length])

  // 处理用户输入
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, userMessage])
    
    // Agent智能响应逻辑
    setTimeout(() => {
      let agentResponse: Message | null = null
      
      // 市场Agent场景
      if (inputMessage.includes('抖音') || inputMessage.includes('直播脚本')) {
        agentResponse = {
          role: 'assistant',
          content: '已生成抖音直播脚本《30分钟搞定到店礼转化》\n\n【开场话术】\n各位家人们，今天给大家准备了超值福利！现在下单预约试驾，到店就送价值998元的智能车载套装...\n\n【互动钩子】\n扣1预约试驾，扣2了解金融方案\n\n【转化引导】\n前50名到店客户，额外赠送3000元置换补贴，名额有限...',
          editable: true,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '发送给团队', type: 'primary' },
            { label: '生成老带新海报', type: 'secondary' }
          ]
        }
      } else if (inputMessage.includes('老带新') || inputMessage.includes('海报')) {
        agentResponse = {
          role: 'assistant',
          content: '已生成老带新海报文案\n\n【主标题】老客推荐，双方得利\n\n【核心文案】\n推荐好友购车，您得3000元现金\n好友享受2000元专属优惠\n\n【行动召唤】扫码立即推荐，48小时内到店有效\n\n补充推荐：当前可对接"车线索"供应商，线索到店率40%，单价¥45-60。需要采购吗？',
          editable: true,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '采购线索', type: 'primary' },
            { label: '暂时不用', type: 'secondary' }
          ]
        }
      } else if (inputMessage.includes('生成话术') || inputMessage.includes('跟进')) {
        agentResponse = {
          role: 'assistant',
          content: '已根据客户B画像生成定制化跟进话术：\n\n【问题切入】\n张先生您好！上次聊到您对续航有顾虑，我特地整理了一份ES6 vs Model Y的实测数据对比...\n\n【优势强化】\nES6配备100kWh电池包，CLTC续航610km，实际高速续航可达480km，比Model Y长续航版多50km。更重要的是，我们全国已有2000+换电站，3分钟满电，比充电快10倍。\n\n【行动引导】\n本周六有ES6深度试驾活动，包含高速+城市路况测试，我帮您预留一个名额？',
          editable: true,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '发送', type: 'primary' },
            { label: '修改话术', type: 'secondary' }
          ]
        }
      } else if (inputMessage === '发送') {
        agentResponse = {
          role: 'assistant',
          content: '已将话术发送至企业微信，等待客户响应...\n\n系统将在1小时后自动检测客户回复状态，如未回复将提醒您发送追问话术。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        // 模拟1小时后提醒
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '客户B已读未回，要不要生成追问话术？',
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { label: '生成', type: 'primary' },
              { label: '暂不跟进', type: 'secondary' }
            ]
          }])
        }, 3000) // 实际演示中缩短为3秒
      } else if (inputMessage === '生成' && messages[messages.length - 2]?.content.includes('追问话术')) {
        agentResponse = {
          role: 'assistant',
          content: '已生成追问话术：\n\n张先生，刚才发给您的续航对比资料收到了吗？如果还有疑问，我可以安排技术专家1对1解答，或者直接预约试驾让您亲自体验，您看哪个方便？',
          editable: true,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '发送', type: 'primary' }
          ]
        }
      } else if (inputMessage.includes('需要') && selectedLead.id === 3) {
        agentResponse = {
          role: 'assistant',
          content: '已设置定时提醒：\n\n⏰ 明天上午10点：提醒客户C提交贷款资料\n\n待办任务已添加至任务列表（优先级：高）。系统将自动发送微信提醒，您也可以手动跟进。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        setPendingTasks(prev => [...prev, { id: Date.now(), title: '客户C贷款资料跟进', priority: 1 }])
        // 模拟贷款延迟
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '⚠️ 客户C贷款审批延迟1天，交付周期变为8天，要不要生成安抚话术？',
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { label: '生成', type: 'primary' },
              { label: '暂不需要', type: 'secondary' }
            ]
          }])
          // 更新客户C的交付周期
          setLeads(prev => prev.map(lead => 
            lead.id === 3 ? { ...lead, deliveryDays: 8 } : lead
          ))
        }, 3000)
      } else if (inputMessage === '暂时不用' || inputMessage === '暂不跟进' || inputMessage === '暂不需要') {
        agentResponse = {
          role: 'assistant',
          content: '好的，已记录您的决策。如需帮助随时告诉我。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      } else if (inputMessage.includes('采购')) {
        agentResponse = {
          role: 'assistant',
          content: '推荐线索供应商：\n\n【车线索】\n• 单价：¥45-60\n• 到店率：40%\n• 意向分：6-8分\n• 覆盖区域：本地+周边30km\n\n建议采购20条线索（预算¥1000-1200），预计获得8个到店客户，转化2-3单。是否确认采购？',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '确认采购', type: 'primary' },
            { label: '取消', type: 'secondary' }
          ]
        }
      } else if (inputMessage === '确认采购') {
        agentResponse = {
          role: 'assistant',
          content: '✅ 已提交采购申请至店长审批，预计10分钟内完成。线索将自动导入商机池，您可自主获取。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        // 模拟添加新线索
        setTimeout(() => {
          const newLead: Lead = {
            id: 4,
            name: '客户D',
            intentionScore: 7,
            testDrives: 1,
            followUpDays: 3,
            source: '车线索',
            cost: 52,
            sourceType: '购买',
            targetModel: 'ES8',
            competitorModel: '奥迪Q7',
            keyIssue: '觉得价格偏高',
            status: 'active',
            riskLevel: 'high',
            lastContact: '3天前'
          }
          setLeads(prev => [...prev, newLead])
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '⚠️ 客户D流失风险较高（意向分7分，试驾1次，3天未跟进），当前觉得价格偏高，要不要生成降价话术？\n\n当前待办任务4个，已按紧急×价值排序，优先处理客户B和锁单客户。',
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { label: '生成降价话术', type: 'primary' },
              { label: '暂时不跟进', type: 'secondary' }
            ]
          }])
        }, 2000)
      } else {
        // 默认响应
        agentResponse = {
          role: 'assistant',
          content: '我理解您的问题。根据当前商机情况，我建议优先跟进客户B（高意向9分），其次关注客户C的交付进度。需要我为您生成具体的执行方案吗？',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      }
      
      if (agentResponse) {
        setMessages(prev => [...prev, agentResponse])
      }
    }, 800)
    
    setInputMessage('')
  }

  // 切换线索
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
    
    // 根据线索状态加载适配话术
    let contextMessage: Message
    
    if (lead.id === 2) { // 客户B - 销售Agent
      contextMessage = {
        role: 'assistant',
        content: '客户B为高价值客户（意向分9分，试驾2次，跟进15天），当前纠结竞品续航。需要生成跟进话术吗？',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '生成话术', type: 'primary' },
          { label: '暂不需要', type: 'secondary' }
        ]
      }
    } else if (lead.id === 3) { // 客户C - 交付Agent
      contextMessage = {
        role: 'assistant',
        content: '客户C已锁单，需办理贷款，交付周期7天。已自动拉群，要不要提醒跟进贷款资料提交？',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '需要', type: 'primary' },
          { label: '暂不需要', type: 'secondary' }
        ]
      }
    } else if (lead.riskLevel === 'high') { // 高风险客户
      contextMessage = {
        role: 'assistant',
        content: `${lead.name}流失风险较高，${lead.lastContact}未跟进，当前${lead.keyIssue}。需要生成跟进策略吗？`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '生成策略', type: 'primary' },
          { label: '查看详情', type: 'secondary' }
        ]
      }
    } else { // 普通线索
      contextMessage = {
        role: 'assistant',
        content: `已加载${lead.name}的档案：\n\n• 意向分：${lead.intentionScore}/10\n• 试驾次数：${lead.testDrives}次\n• 跟进时长：${lead.followUpDays}天\n• 关键问题：${lead.keyIssue}\n• 目标车型：${lead.targetModel}\n• 对比车型：${lead.competitorModel}\n\n需要我为您生成下一步行动方案吗？`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '生成方案', type: 'primary' }
        ]
      }
    }
    
    setMessages([contextMessage])
  }

  // 排序逻辑
  const sortedLeads = [...leads].sort((a, b) => {
    if (sortBy === 'intention') return b.intentionScore - a.intentionScore
    if (sortBy === 'time') return b.followUpDays - a.followUpDays
    if (sortBy === 'price') return b.cost - a.cost
    return 0
  })

  // 意向分颜色
  const getIntentionColor = (score: number) => {
    if (score >= 8) return 'bg-orange-500 text-white'
    if (score >= 6) return 'bg-amber-400 text-white'
    return 'bg-gray-400 text-white'
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* iPad Container - Fixed 1024x768 */}
      <div className="w-[1024px] h-[768px] bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden flex">
        
        {/* Left Panel - Resource List (40%) */}
        <div className="w-[410px] border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">资源运营工作台</h1>
                <p className="text-xs text-gray-500 mt-0.5">商机管理 · Agent驱动</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setShowSkillConfig(!showSkillConfig)}
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            
            {/* 线索不足警告 */}
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
                  className="pl-9 h-9 bg-gray-100 border-gray-200"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 bg-transparent">
                <Filter className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
            
            {/* 排序切换 */}
            <div className="flex gap-1.5">
              <Button 
                variant={sortBy === 'intention' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => setSortBy('intention')}
              >
                意向排序
              </Button>
              <Button 
                variant={sortBy === 'time' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => setSortBy('time')}
              >
                时间排序
              </Button>
              <Button 
                variant={sortBy === 'price' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={() => setSortBy('price')}
              >
                价格排序
              </Button>
            </div>
          </div>

          {/* List - 电商式列表 - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {sortedLeads.filter(lead => lead.status !== 'completed').map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all border rounded-lg hover:shadow-md bg-white",
                    selectedLead.id === lead.id 
                      ? "border-blue-500 shadow-sm ring-1 ring-blue-500" 
                      : "border-gray-200 hover:border-gray-300",
                    lead.riskLevel === 'high' && "border-red-300 bg-red-50"
                  )}
                  onClick={() => handleLeadClick(lead)}
                >
                  {/* Layer 1 - 市场信息 */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{lead.source}</span>
                    <span className="text-xs text-gray-700 font-medium">¥{lead.cost}</span>
                    <Badge variant="outline" className={cn(
                      "text-xs px-1.5 py-0 h-4 text-xs",
                      lead.sourceType === '自主获取' 
                        ? "border-green-300 bg-green-50 text-green-700" 
                        : "border-blue-300 bg-blue-50 text-blue-700"
                    )}>
                      {lead.sourceType}
                    </Badge>
                    {lead.riskLevel === 'high' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 ml-auto" />
                    )}
                    {lead.intentionScore >= 8 && lead.riskLevel !== 'high' && (
                      <Flame className="w-3.5 h-3.5 text-orange-500 ml-auto" />
                    )}
                  </div>

                  {/* Layer 2 - 销售信息 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{lead.name}</span>
                      <Badge className={cn("text-xs px-1.5 py-0 h-5 font-semibold", getIntentionColor(lead.intentionScore))}>
                        {lead.intentionScore}分
                      </Badge>
                      <div className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{lead.followUpDays}天</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span>试驾{lead.testDrives}次</span>
                      <span className="text-gray-300">·</span>
                      <span>{lead.keyIssue}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700 px-2 py-0 h-5 font-medium">
                        {lead.targetModel}
                      </Badge>
                      <span className="text-xs text-gray-400">vs</span>
                      <Badge variant="outline" className="text-xs border-gray-200 bg-gray-100 text-gray-600 px-2 py-0 h-5">
                        {lead.competitorModel}
                      </Badge>
                    </div>
                  </div>

                  {/* Layer 3 - 交付信息 (仅已锁单) */}
                  {lead.status === 'locked' && (
                    <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-gray-700 font-medium">{lead.financeStatus}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-gray-700">{lead.deliveryDays}天</span>
                      </div>
                      <span className="text-gray-500">{lead.deliverySpecialist}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right Panel - Gemini-Style AI Interface (60%) */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Minimalist Header - Fixed */}
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">智能销售专家</span>
              <span className="text-xs text-gray-400">Gemini驱动</span>
            </div>
            <div className="flex items-center gap-2">
              {pendingTasks.length > 0 && (
                <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700 text-xs">
                  {pendingTasks.length}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-500 hover:text-gray-700" 
                onClick={() => setShowSkillConfig(!showSkillConfig)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Conversation Stream or Empty State - Scrollable with fixed height */}
          <div className="flex-1 overflow-y-auto px-8 py-6" style={{ height: 'calc(100% - 64px - 80px)' }}>
            {messages.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center -mt-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-5 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">你好，我是智能销售专家</h3>
                <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
                  从左侧选择客户，我会提供针对性的策略建议。或者直接告诉我你需要什么帮助。
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  <button 
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 transition-all hover:shadow-sm"
                    onClick={() => {
                      setInputMessage('分析今日紧急线索')
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                  >
                    分析今日紧急线索
                  </button>
                  <button 
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 transition-all hover:shadow-sm"
                    onClick={() => {
                      setInputMessage('帮我写个直播脚本')
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                  >
                    帮我写个直播脚本
                  </button>
                  <button 
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 transition-all hover:shadow-sm"
                    onClick={() => {
                      setInputMessage('查看我的待办任务')
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                  >
                    查看我的待办任务
                  </button>
                </div>
              </div>
            ) : (
              /* Seamless Conversation Stream */
              <div className="space-y-6 pb-32">
                {messages.map((message, index) => (
                  <div key={index} className="space-y-3">
                    {/* User Message */}
                    {message.role === 'user' && (
                      <div className="pl-1">
                        <div className="text-[15px] leading-relaxed text-gray-800 font-medium">
                          {message.content}
                        </div>
                      </div>
                    )}
                    
                    {/* AI Message */}
                    {message.role === 'assistant' && (
                      <div className="group">
                        <div className="flex-1 min-w-0">
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('\n').map((line, i) => {
                              // Heading style
                              if (line.startsWith('【') && line.endsWith('】')) {
                                return <h4 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0">{line.replace(/【|】/g, '')}</h4>
                              }
                              // Bullet points
                              if (line.startsWith('•') || line.startsWith('- ')) {
                                return <li key={i} className="text-[15px] leading-relaxed text-gray-700 ml-4 mb-1">{line.replace(/^[•-]\s*/, '')}</li>
                              }
                              // Icons/Emojis
                              if (line.startsWith('⚠️') || line.startsWith('⏰') || line.startsWith('✅')) {
                                return <p key={i} className="text-[15px] leading-relaxed text-gray-800 font-medium my-2 bg-gray-50 px-3 py-2 rounded-lg inline-block">{line}</p>
                              }
                              // Code block
                              if (line.includes('话术') && i > 0 && message.content.includes('【')) {
                                return <p key={i} className="text-[15px] leading-relaxed text-gray-700 mb-2">{line}</p>
                              }
                              // Regular text
                              if (line.trim()) {
                                return <p key={i} className="text-[15px] leading-relaxed text-gray-700 mb-2">{line}</p>
                              }
                              return <br key={i} />
                            })}
                          </div>
                          
                          {/* Inline Actions */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="flex gap-2 mt-4">
                              {message.actions.map((action, actionIndex) => (
                                <button
                                  key={actionIndex}
                                  className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                    action.type === 'primary' 
                                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                  )}
                                  onClick={() => {
                                    setInputMessage(action.label)
                                    setTimeout(() => handleSendMessage(), 100)
                                  }}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Edit Button */}
                          {message.editable && (
                            <button className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit3 className="w-3 h-3" />
                              <span>编辑响应</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Large Rectangular Input Box - LLM Style */}
          <div className="shrink-0 px-8 pb-8 bg-white">
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

      {/* Skill配置弹窗 */}
      {showSkillConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSkillConfig(false)}>
          <Card className="w-[600px] p-6 bg-white" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Skill配置中心</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">市场Agent - MKT-001</h4>
                  <Badge variant="outline" className="text-xs">已启用</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3">获客素材生成：直播脚本、老带新海报</p>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">修改策略</Button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">销售Agent - SAL-002</h4>
                  <Badge variant="outline" className="text-xs">已启用</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3">话术生成：跟进脚本、追问策略</p>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">修改策略</Button>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">交付Agent - DEL-001</h4>
                  <Badge variant="outline" className="text-xs">已启用</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3">交付协调：贷款跟进、进度提醒</p>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">修改策略</Button>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowSkillConfig(false)}>关闭</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
