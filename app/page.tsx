'use client'

import React from "react"

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
  Flame,
  Bell,
  List,
  TrendingUp,
  DollarSign,
  Phone,
  FileText
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

// 通知类型
type NotificationType = 'critical' | 'insight' | 'success' | 'routine'

type Notification = {
  id: number
  type: NotificationType
  title: string
  category: 'market' | 'sales' | 'delivery' | 'ai'
  timestamp: string
  relatedLeadId?: number
}

// 通知数据
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: '[新商机] 新分配高意向线索（张先生·L9），来源：抖音直播。',
    category: 'market',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    relatedLeadId: 3
  },
  {
    id: 2,
    type: 'insight',
    title: '[商机洞察] 客户赵先生刚刚查看了 5 次金融计算器，意向分升至 9 分。',
    category: 'ai',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    relatedLeadId: 5
  },
  {
    id: 3,
    type: 'critical',
    title: '[交付预警] 客户陈女士贷款审批被退回，原因：收入证明模糊。',
    category: 'delivery',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    relatedLeadId: 4
  },
  {
    id: 4,
    type: 'critical',
    title: '[客户激活] S级客户李总回复了您的海报："这款车有现车吗？"',
    category: 'sales',
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    relatedLeadId: 1
  }
]

// 初始商机数据
const initialLeads: Lead[] = [
  {
    id: 1,
    name: '李先生',
    intentionScore: 9,
    testDrives: 3,
    followUpDays: 14,
    source: '线下到店',
    cost: 0,
    sourceType: '自主获取',
    targetModel: '理想MEGA',
    competitorModel: '腾势D9',
    keyIssue: '14天未联系',
    status: 'active',
    riskLevel: 'high',
    lastContact: '14天前'
  },
  {
    id: 2,
    name: '王先生',
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
    id: 3,
    name: '张三',
    intentionScore: 6,
    testDrives: 0,
    followUpDays: 1,
    source: '线上线索',
    cost: 48,
    sourceType: '购买',
    targetModel: '理想L6',
    competitorModel: '问界M7',
    keyIssue: '新线索待跟进',
    status: 'active',
    riskLevel: 'low',
    lastContact: '1天前'
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
  const [showNotification, setShowNotification] = useState(true)
  const [notifications] = useState<Notification[]>(mockNotifications)
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(1) // Show insight by default
  const [showNotificationHistory, setShowNotificationHistory] = useState(false) // Declare the variable

  // 初始化 - Scenario 2: Market Agent Lead Shortage
  useEffect(() => {
    const kickoffMessage: Message = {
      role: 'assistant',
      content: '👋 早上好，小张！又是元气满满的一天。',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      suggestion: '下一步建议：需要我为您生成获客方案吗？',
      actionChips: []
    }
    
    const userResponse: Message = {
      role: 'user',
      content: '需要',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    const strategyMessage: Message = {
      role: 'assistant',
      content: '当前商机资源不足，为您生成获客策略',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `策略 A：主动营销（低成本）

素材生成：L9 促销倒计时 2 天素材
• 文案："马年购新车，智享全家福。理想L9新春限时优惠最后2天！"
• 海报模板：[马年L9权益] 新年购新车，限时立减2万元
• 发布渠道：朋友圈/企微/抖音

策略 B：线索采买（高效率）

建议补充 L6/L9 高意向线索 10 条
• 单价：¥48/条
• 预算：¥480
• 预计转化率：30%
• 预估成交：3台`,
      actionChips: ['一键发布朋友圈', '直接提交采买', '查看详细方案']
    }
    
    const userSelection: Message = {
      role: 'user',
      content: '直接提交采买',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    const confirmationMessage: Message = {
      role: 'assistant',
      content: '✅ 已收到 1 条采买下发 L6 新商机',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      suggestion: '新线索"刘先生"已添加到资源列表，建议 1 小时内完成首次跟进',
      actionChips: ['生成跟进话术', '查看客户详情', '设置提醒']
    }
    
    setMessages([kickoffMessage, userResponse, strategyMessage, userSelection, confirmationMessage])
    
    // Simulate adding new lead to the list after 1 second
    setTimeout(() => {
      const newLead: Lead = {
        id: 99,
        name: '刘先生',
        intentionScore: 7,
        testDrives: 0,
        followUpDays: 0,
        source: '线索采买',
        cost: 48,
        sourceType: '购买',
        targetModel: '理想L6',
        competitorModel: '小鹏G6',
        keyIssue: '新线索待跟进',
        status: 'active',
        riskLevel: 'low',
        lastContact: '刚刚'
      }
      setLeads(prev => [newLead, ...prev])
    }, 1000)
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

  // Handle Notification Bar Click - Show notification details
  const handleNotificationBarClick = () => {
    const currentNotif = notifications[currentNotificationIndex]
    showNotificationDetail(currentNotif)
  }

  // Handle Notification History Icon Click
  const handleNotificationHistoryClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNotificationHistory(true)
  }

  // Show specific notification detail
  const showNotificationDetail = (notif: Notification) => {
    switch (notif.id) {
      case 1: // Market - New Lead
        showMarketNewLeadCard()
        break
      case 2: // AI Insight - Buying Signal
        showAIInsightCard()
        break
      case 3: // Delivery Risk
        showDeliveryRiskCard()
        break
      case 4: // Sales Activation
        showSalesActivationCard()
        break
    }
  }

  // Show All Notifications History
  const showAllNotificationHistory = () => {
    const historyMessage: Message = {
      role: 'assistant',
      content: '📋 通知中心',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `最近通知：

🔔 [客户激活] S级客户李总回复了您的海报："这款车有现车吗？"
   时间：${notifications[3].timestamp} | 优先级：高

🚨 [交付预警] 客户陈女士贷款审批被退回，原因：收入证明模糊。
   时间：${notifications[2].timestamp} | 优先级：紧急

📈 [商机洞察] 客户赵先生刚刚查看了 5 次金融计算器，意向分升至 9 分。
   时间：${notifications[1].timestamp} | 优先级：中

🆕 [新商机] 新分配高意向线索（张先生·L9），来源：抖音直播。
   时间：${notifications[0].timestamp} | 优先级：中`,
      actionChips: ['全部标为已读', '筛选紧急通知', '返回']
    }
    setMessages([historyMessage])
  }

  // Market: New Lead Card
  const showMarketNewLeadCard = () => {
    const newLeadMessage: Message = {
      role: 'assistant',
      content: '🆕 新商机分配',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `您有一条高意向线索（张先生·L9）已分配

来源：抖音直播
意向分：8 分
试驾次数：0 次
关键需求：家庭用车、6座需求

系统建议：
• 24小时内完成首次联系
• 推荐话术：强调L9的6座独立空间和家庭出行体验`,
      actionChips: ['📞 立即拨打', '查看详情']
    }
    setMessages([newLeadMessage])
  }

  // AI Insight: Buying Signal Card
  const showAIInsightCard = () => {
    const insightMessage: Message = {
      role: 'assistant',
      content: '📈 购买信号捕捉',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `监测到赵先生行为活跃，意向分跃升

行为分析：
• 过去1小时查看金融计算器 5 次
• 重点关注"36期0息"方案
• 意向分从 7 分升至 9 分

AI判断：客户对分期方案感兴趣，处于决策临界点

建议行动：
1. 立即推送"36期0息"详细方案
2. 附带本月金融优惠截止提醒（制造紧迫感）
3. 预约周末到店办理（提供绿色通道承诺）`,
      suggestion: '需要我生成逼单话术吗？',
      actionChips: ['📝 生成逼单话术', '发送金融方案']
    }
    setMessages([insightMessage])
  }

  // Delivery: Risk Alert Card
  const showDeliveryRiskCard = () => {
    const riskMessage: Message = {
      role: 'assistant',
      content: '🚨 交付异常处理',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `陈女士的贷款有拒批风险

问题详情：
• 审批状态：被退回
• 退回原因：收入证明图片模糊，无法识别
• 风险等级：高（72小时内未处理将影响交付）

所需材料：
✅ 近3个月工资流水（清晰版）
✅ 收入证明（加盖公章）
✅ 身份证复印件

处理建议：
1. 立即联系客户说明情况
2. 协助客户准备清晰材料
3. 联系交付专家加急处理`,
      actionChips: ['📞 联系交付专家', '发送补件清单']
    }
    setMessages([riskMessage])
  }

  // Sales: Customer Activation Card
  const showSalesActivationCard = () => {
    const activationMessage: Message = {
      role: 'assistant',
      content: '💬 高意向回复',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `沉睡客户李总（意向分9）被海报激活

客户回复："这款车有现车吗？"

客户画像：
• 上次跟进：14天前
• 历史意向：MEGA + 纯电长途焦虑
• 消费能力：高（关注过顶配版本）

推荐回复策略：
"李总好！MEGA现在有现车，而且是您之前看的琥珀棕顶配版本。刚好有车主实测续航数据（327公里实际跑了300+），周末可以安排长途试驾体验。"

亮点：
✅ 直接回答"有现车"（解决核心需求）
✅ 呼应历史顾虑（续航焦虑）
✅ 提供行动方案（周末试驾）`,
      actionChips: ['💬 快捷回复：有现车', '查看库存表']
    }
    setMessages([activationMessage])
  }

  // Handle Notification Click - Scenario 4: Delivery Agent (keep original)
  const handleOldNotificationClick = () => {
    setShowNotification(false)
    const wangLead = leads.find(l => l.id === 2 && l.name === '王先生')
    if (wangLead) {
      setSelectedLead(wangLead)
      showDeliverySync()
    }
  }

  // Show Delivery Sync Card
  const showDeliverySync = () => {
    const deliveryHeader: Message = {
      role: 'assistant',
      content: '🚚 交付协同 (Delivery Agent)',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `王先生已于 26年2月3日 锁单

匹配交付专家：@刘交付

系统自动完成：
✅ 创建专属交付群
✅ 同步客户权益
✅ 生成欢迎语`,
      suggestion: '请确认并发送欢迎消息给王先生',
      actionChips: []
    }

    const welcomeMessage: Message = {
      role: 'assistant',
      content: '欢迎语草稿（可编辑）',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      codeBlock: `王先生您好，欢迎加入理想大家庭！🎉

我是您的专属交付顾问 @刘交付，很高兴为您服务。

您订购的车型信息：
• 车型：理想 MEGA
• 付款方式：贷款
• 预计交付：3天内

接下来我们将为您提供：
✅ 专属交付群全程跟踪
✅ 车辆配置最终确认
✅ 金融方案办理协助
✅ 交付流程一站式服务

有任何问题随时联系我，期待与您见面！`,
      actionChips: ['发送', '编辑内容', '稍后处理']
    }

    setMessages([deliveryHeader, welcomeMessage])
  }

  // 切换线索 - Scenario 3: Sales Agent (Conversion) + Scenario 4 Handler
  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
    
    // Special handling for 王先生 - Scenario 4: Delivery Sync
    if (lead.id === 2 && lead.name === '王先生' && lead.status === 'locked') {
      setShowNotification(false)
      showDeliverySync()
      return
    }
    
    // Special handling for 李先生 - Scenario 3
    if (lead.id === 1 && lead.name === '李先生') {
      const riskWarning: Message = {
        role: 'assistant',
        content: '⚠️ 风险预警：流失风险',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        codeBlock: `意向分 90，已 14 天未联系。监测到客户在 App 搜索'纯电长途规划'，推测存在'长途续航焦虑'。

【生成转化话术】

李先生早！

刚在微博看到 MEGA 车主实测 327 公里长途（满电、空调、高速），实际续航达标率 92%，比官方 NEDC 还准。发给您参考：

[附件：微博链接 - 车主亲测 MEGA 续航]

咱们店里正好有现车，要不周末来实际体验下长途模式？我帮您规划个真实场景测试。`,
        suggestion: '是否通过企微发送？',
        actionChips: ['需要', '调整话术', '查看续航数据']
      }
      
      setMessages([riskWarning])
      
      // Auto-simulate user response after 2 seconds
      setTimeout(() => {
        const userResponse: Message = {
          role: 'user',
          content: '需要',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        
        const confirmFeedback: Message = {
          role: 'assistant',
          content: '✅ 已唤起企业微信并填入话术',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          suggestion: '建议 30 分钟后跟进客户回复情况',
          actionChips: []
        }
        
        setMessages(prev => [...prev, userResponse, confirmFeedback])
      }, 2000)
      
      return
    }
    
    // Default handling for other leads
    let contextMessage: Message = {
      role: 'assistant',
      content: `已切换到${lead.name}（意向分${lead.intentionScore}/10，${lead.keyIssue}）。`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      actionChips: ['生成跟进方案', '查看详情', '设置提醒']
    }
    
    if (lead.riskLevel === 'high' && lead.id !== 1) {
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

  // 通知样式
  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          icon: 'text-red-600',
          border: 'border-red-200'
        }
      case 'insight':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          border: 'border-blue-200'
        }
      case 'success':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          icon: 'text-green-600',
          border: 'border-green-200'
        }
      case 'routine':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          border: 'border-gray-200'
        }
    }
  }

  // 通知图标
  const getNotificationIcon = (notif: Notification) => {
    if (notif.type === 'critical') return <AlertTriangle className="w-4 h-4" />
    if (notif.type === 'insight') return <TrendingUp className="w-4 h-4" />
    if (notif.type === 'success') return <DollarSign className="w-4 h-4" />
    return <Bell className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* iPad Container - Fixed 1024x768 */}
      <div className="w-[1024px] h-[768px] bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden flex flex-col">
        
        {/* Notification Bar - Scenario 4 */}
        {showNotification && (
          <div 
            className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-700 transition-colors shrink-0"
            onClick={handleNotificationBarClick}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <span className="text-sm font-medium">你有一个锁单客户待与交付交接</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </div>
        )}
        
        {/* Main Content Container */}
        <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel - List View (35%) */}
        <div className="w-[358px] border-r border-gray-200 flex flex-col bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">资源运营</h1>
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
            
            {/* Smart Notification Bar */}
            {notifications.length > 0 && (
              <div 
                className={cn(
                  "rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer transition-all hover:shadow-md",
                  getNotificationStyle(notifications[currentNotificationIndex].type).bg,
                  getNotificationStyle(notifications[currentNotificationIndex].type).border,
                  "border"
                )}
                onClick={handleNotificationBarClick}
              >
                {/* Left: Dynamic Icon */}
                <div className={cn(
                  "shrink-0",
                  getNotificationStyle(notifications[currentNotificationIndex].type).icon
                )}>
                  {getNotificationIcon(notifications[currentNotificationIndex])}
                </div>
                
                {/* Center: Notification Text (truncated) */}
                <p className={cn(
                  "flex-1 text-xs font-medium truncate",
                  getNotificationStyle(notifications[currentNotificationIndex].type).text
                )}>
                  {notifications[currentNotificationIndex].title}
                </p>
                
                {/* Right: History Icon */}
                <button
                  className={cn(
                    "shrink-0 p-1 hover:bg-white/50 rounded transition-colors",
                    getNotificationStyle(notifications[currentNotificationIndex].type).icon
                  )}
                  onClick={handleNotificationHistoryClick}
                  title="查看所有通知"
                >
                  <List className="w-4 h-4" />
                </button>
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
                    lead.riskLevel === 'high' && "bg-red-50/50 border-l-4 border-l-red-400",
                    lead.status === 'locked' && "bg-green-50/50"
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
                        {lead.id === 99 && (
                          <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                            NEW
                          </Badge>
                        )}
                      </div>
                      
                      {/* Layer 2: Sales Info (Middle & Prominent) */}
                      <div className="space-y-1.5">
                        {/* Primary: Name + Score Badge + Locked Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">{lead.name}</span>
                          <Badge className={cn("text-[11px] px-2 py-0.5", getIntentionColor(lead.intentionScore))}>
                            {lead.intentionScore}分
                          </Badge>
                          {lead.status === 'locked' && (
                            <Badge className="bg-green-600 text-white text-[11px] px-2 py-0.5">
                              已锁单
                            </Badge>
                          )}
                        </div>
                        
                        {/* Secondary: Stats */}
                        <div className="text-xs text-gray-600">
                          试驾{lead.testDrives}次 · {lead.keyIssue}
                        </div>
                        
                        {/* Visual Tags: Car Models + Special Tags for 李先生 */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 font-medium">
                            {lead.targetModel}
                          </Badge>
                          <span className="text-xs text-gray-400">vs</span>
                          <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs px-2 py-0.5">
                            {lead.competitorModel}
                          </Badge>
                          {lead.id === 1 && lead.name === '李先生' && (
                            <>
                              <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 font-medium">
                                MEGA意向
                              </Badge>
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 font-medium">
                                锁单犹豫期
                              </Badge>
                            </>
                          )}
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
                    
                    {/* AI Message - Styled Card Layout */}
                    {message.role === 'assistant' && (
                      <div className="space-y-4">
                        {/* Greeting */}
                        <div className="text-lg text-gray-800">
                          {message.content}
                        </div>
                        
                        {/* Highlight Section (Gold/Yellow Tint) */}
                        {index === 0 && (
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                            <p className="text-sm text-gray-800">
                              🌟 高光时刻：昨天拿下一台 L9 订单，本月目标达成率 80%，领跑全店！
                            </p>
                          </div>
                        )}
                        
                        {/* Focus Section (Blue Tint) */}
                        {index === 0 && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg space-y-2">
                            <p className="text-sm text-gray-800">
                              🎯 今日聚焦：今日目标线索 5 条，当前已完成 2 条
                            </p>
                            <p className="text-sm text-gray-600">
                              月目标缺口 2 台，资源库存不足（当前 {leads.length} 条线索 {'<'} 安全阈值 10 条）
                            </p>
                          </div>
                        )}
                        
                        {/* Code Block for Script/Content */}
                        {message.codeBlock && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-[14px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                            {message.codeBlock}
                          </div>
                        )}
                        
                        {/* Action Trigger Text */}
                        {message.suggestion && (
                          <div className="text-[15px] text-gray-700 italic">
                            {message.suggestion}
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
    </div>
  )
}
