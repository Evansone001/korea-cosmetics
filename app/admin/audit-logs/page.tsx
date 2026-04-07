'use client'

import { useEffect, useState } from 'react'
import { 
  Shield, ShieldAlert, ShieldCheck, Activity, Globe, Lock, 
  AlertTriangle, CheckCircle, Clock, Server, Smartphone,
  Eye, Fingerprint, Zap, Bot, TrendingUp, TrendingDown,
  FileText, Download, Filter, Search, ChevronDown, MoreHorizontal,
  MapPin, User, AlertOctagon, Ban, Unlock, Key, Terminal,
  Cpu, Wifi, Database, HardDrive, RefreshCw, Bell, Settings,
  ChevronRight, X, Calendar, BarChart3, PieChart, LineChart
} from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

// Types
interface SecurityEvent {
  id: string
  timestamp: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'authentication' | 'authorization' | 'data_access' | 'attack' | 'anomaly'
  type: string
  description: string
  userId?: string
  userName?: string
  ipAddress: string
  geolocation?: {
    country: string
    city: string
    lat: number
    lng: number
  }
  deviceFingerprint?: string
  userAgent: string
  threatScore: number
  aiAnalysis?: {
    anomalyScore: number
    threatCategory: string
    confidence: number
    riskFactors: string[]
    recommendedAction: string
  }
  actionTaken?: string
  acknowledged: boolean
  escalated: boolean
}

interface SecurityMetrics {
  activeThreats: number
  securityScore: number
  failedLogins24h: number
  blockedAttacks: number
  criticalAlerts: number
  systemHealth: number
}

interface DeviceFingerprint {
  id: string
  trustScore: number
  firstSeen: string
  lastSeen: string
  suspicious: boolean
  userAgent: string
  geolocation: string
  associatedUsers: string[]
}

// Mock Data
const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    severity: 'critical',
    category: 'attack',
    type: 'sql_injection_attempt',
    description: 'SQL injection attempt detected on product search endpoint',
    userId: 'anonymous',
    ipAddress: '192.168.1.100',
    geolocation: { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
    userAgent: 'Mozilla/5.0 (compatible; AttackBot/1.0)',
    threatScore: 95,
    aiAnalysis: {
      anomalyScore: 98,
      threatCategory: 'Automated Attack',
      confidence: 0.97,
      riskFactors: ['Known malicious IP', 'SQL injection pattern', 'Bot user agent'],
      recommendedAction: 'Block IP immediately and review access logs'
    },
    actionTaken: 'IP Blocked',
    acknowledged: true,
    escalated: true
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    severity: 'high',
    category: 'authentication',
    type: 'brute_force_attempt',
    description: 'Multiple failed login attempts for user admin@kbeauty.co.ke',
    userId: 'admin_1',
    userName: 'Admin User',
    ipAddress: '185.220.101.45',
    geolocation: { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.405 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    threatScore: 78,
    aiAnalysis: {
      anomalyScore: 82,
      threatCategory: 'Brute Force Attack',
      confidence: 0.89,
      riskFactors: ['Multiple failed attempts', 'Suspicious IP location', 'After hours access'],
      recommendedAction: 'Enable 2FA and notify user'
    },
    actionTaken: 'Account Locked',
    acknowledged: false,
    escalated: false
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    severity: 'medium',
    category: 'anomaly',
    type: 'unusual_data_access',
    description: 'User accessed 500+ customer records in 5 minutes',
    userId: 'store_manager_1',
    userName: 'Store Manager',
    ipAddress: '41.60.234.12',
    geolocation: { country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    threatScore: 65,
    aiAnalysis: {
      anomalyScore: 71,
      threatCategory: 'Data Exfiltration Risk',
      confidence: 0.76,
      riskFactors: ['Unusual access pattern', 'High data volume', 'Business hours anomaly'],
      recommendedAction: 'Review user activity and verify business need'
    },
    actionTaken: 'Under Review',
    acknowledged: false,
    escalated: false
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    severity: 'low',
    category: 'authorization',
    type: 'privilege_escalation_attempt',
    description: 'User attempted to access admin functions without permission',
    userId: 'vendor_123',
    userName: 'Vendor User',
    ipAddress: '102.68.78.90',
    geolocation: { country: 'Kenya', city: 'Mombasa', lat: -4.0435, lng: 39.6682 },
    userAgent: 'Mozilla/5.0 (Linux; Android 10)',
    threatScore: 35,
    aiAnalysis: {
      anomalyScore: 42,
      threatCategory: 'Privilege Escalation',
      confidence: 0.65,
      riskFactors: ['Unauthorized endpoint access', 'Low privilege user'],
      recommendedAction: 'Monitor user behavior and provide training'
    },
    actionTaken: 'Access Denied',
    acknowledged: true,
    escalated: false
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    severity: 'info',
    category: 'authentication',
    type: 'successful_login',
    description: 'Successful login from new device',
    userId: 'admin_2',
    userName: 'Super Admin',
    ipAddress: '197.232.62.100',
    geolocation: { country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    threatScore: 15,
    aiAnalysis: {
      anomalyScore: 22,
      threatCategory: 'New Device Login',
      confidence: 0.45,
      riskFactors: ['New device fingerprint', 'Known IP address'],
      recommendedAction: 'Verify device with user'
    },
    actionTaken: 'Verification Sent',
    acknowledged: true,
    escalated: false
  }
]

const mockMetrics: SecurityMetrics = {
  activeThreats: 12,
  securityScore: 87,
  failedLogins24h: 147,
  blockedAttacks: 89,
  criticalAlerts: 3,
  systemHealth: 98
}

const mockFingerprints: DeviceFingerprint[] = [
  {
    id: 'fp_1',
    trustScore: 95,
    firstSeen: '2024-01-01T00:00:00Z',
    lastSeen: new Date().toISOString(),
    suspicious: false,
    userAgent: 'Chrome 120 on Windows 10',
    geolocation: 'Nairobi, Kenya',
    associatedUsers: ['admin_1', 'admin_2']
  },
  {
    id: 'fp_2',
    trustScore: 23,
    firstSeen: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    lastSeen: new Date(Date.now() - 2 * 60000).toISOString(),
    suspicious: true,
    userAgent: 'AttackBot/1.0',
    geolocation: 'Moscow, Russia',
    associatedUsers: ['anonymous']
  }
]

// Helper functions
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500 text-white'
    case 'high': return 'bg-orange-500 text-white'
    case 'medium': return 'bg-yellow-500 text-white'
    case 'low': return 'bg-blue-500 text-white'
    case 'info': return 'bg-slate-500 text-white'
    default: return 'bg-slate-400 text-white'
  }
}

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'info': return 'bg-slate-100 text-slate-700 border-slate-200'
    default: return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'authentication': return <Lock className="w-4 h-4" />
    case 'authorization': return <Key className="w-4 h-4" />
    case 'data_access': return <Database className="w-4 h-4" />
    case 'attack': return <ShieldAlert className="w-4 h-4" />
    case 'anomaly': return <Activity className="w-4 h-4" />
    default: return <AlertTriangle className="w-4 h-4" />
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

// Components
const SecurityMetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color, 
  subtitle 
}: { 
  title: string
  value: string | number
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  color: string
  subtitle?: string
}) => (
  <div className={`bg-white rounded-2xl p-6 border-2 ${color} shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color.replace('border-', 'bg-').replace('500', '100')}`}>
        <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-3">
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : trend === 'down' ? (
          <TrendingDown className="w-4 h-4 text-green-500" />
        ) : (
          <Activity className="w-4 h-4 text-slate-400" />
        )}
        <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-green-600' : 'text-slate-500'}`}>
          {trend === 'up' ? '+12%' : trend === 'down' ? '-8%' : 'Stable'}
        </span>
        <span className="text-xs text-slate-400">vs last 24h</span>
      </div>
    )}
  </div>
)

const AIThreatPanel = () => (
  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800">AI Threat Intelligence</h3>
        <p className="text-xs text-slate-500">Real-time analysis & predictions</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Critical Threat Detected</p>
            <p className="text-xs text-slate-500">SQL injection pattern from 192.168.1.xxx</p>
          </div>
        </div>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">98% confidence</span>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Attack Trend</p>
            <p className="text-xs text-slate-500">+23% increase in brute force attempts</p>
          </div>
        </div>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Predicted</span>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">System Protected</p>
            <p className="text-xs text-slate-500">All active threats neutralized</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Safe</span>
      </div>
    </div>
  </div>
)

const ThreatMap = () => (
  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Live Threat Map
        </h3>
        <p className="text-xs text-slate-400">Real-time attack origins</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs text-slate-400">Live</span>
      </div>
    </div>
    
    <div className="relative h-48 bg-slate-800 rounded-xl overflow-hidden">
      {/* Simplified world map representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-8 gap-1 opacity-30">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-slate-600 rounded-sm" />
          ))}
        </div>
      </div>
      
      {/* Attack points */}
      <div className="absolute top-8 left-16 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      <div className="absolute top-16 left-24 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
      <div className="absolute top-12 left-48 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
      <div className="absolute top-24 left-32 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    </div>
    
    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="text-center">
        <p className="text-lg font-bold text-red-400">12</p>
        <p className="text-xs text-slate-400">Active Attacks</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-orange-400">8</p>
        <p className="text-xs text-slate-400">Countries</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-emerald-400">89</p>
        <p className="text-xs text-slate-400">Blocked Today</p>
      </div>
    </div>
  </div>
)

const SecurityEventRow = ({ event, onSelect }: { event: SecurityEvent; onSelect: (e: SecurityEvent) => void }) => (
  <div className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
      event.acknowledged ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
    }`}
    onClick={() => onSelect(event)}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityBadge(event.severity)}`}>
          {getCategoryIcon(event.category)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-800">{event.description}</p>
            {!event.acknowledged && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(event.timestamp)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.geolocation?.city}, {event.geolocation?.country}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {event.userName || event.userId}
            </span>
            {event.ipAddress && (
              <span className="font-mono text-slate-400">{event.ipAddress}</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(event.severity)}`}>
          {event.severity}
        </span>
        <p className="text-xs text-slate-400 mt-1">Score: {event.threatScore}</p>
      </div>
    </div>
  </div>
)

const FingerprintPanel = ({ fingerprints }: { fingerprints: DeviceFingerprint[] }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
          <Fingerprint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Device Fingerprints</h3>
          <p className="text-xs text-slate-500">System identification & trust scoring</p>
        </div>
      </div>
      <span className="text-sm text-slate-500">{fingerprints.length} devices</span>
    </div>
    
    <div className="space-y-3">
      {fingerprints.map((fp) => (
        <div key={fp.id} className={`p-3 rounded-xl border ${fp.suspicious ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fp.suspicious ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <Smartphone className={`w-5 h-5 ${fp.suspicious ? 'text-red-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <p className="font-medium text-slate-800">{fp.userAgent}</p>
                <p className="text-xs text-slate-500">{fp.geolocation}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${fp.trustScore > 70 ? 'text-emerald-600' : fp.trustScore > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {fp.trustScore}%
              </p>
              <p className="text-xs text-slate-400">Trust Score</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span>First: {new Date(fp.firstSeen).toLocaleDateString()}</span>
            <span>Last: {formatTime(fp.lastSeen)}</span>
            {fp.suspicious && (
              <span className="text-red-600 font-medium">⚠️ Suspicious</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const CompliancePanel = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Compliance Status</h3>
          <p className="text-xs text-slate-500">GDPR & PCI DSS monitoring</p>
        </div>
      </div>
      <span className="text-sm font-medium text-emerald-600">✓ Compliant</span>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="font-medium text-slate-800">GDPR Compliance</p>
            <p className="text-xs text-slate-500">Data access logs complete</p>
          </div>
        </div>
        <span className="text-sm font-bold text-emerald-600">100%</span>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <div className="flex items-center gap-3">
          <CreditCardIcon className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="font-medium text-slate-800">PCI DSS</p>
            <p className="text-xs text-slate-500">Payment security validated</p>
          </div>
        </div>
        <span className="text-sm font-bold text-emerald-600">✓</span>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-slate-800">Audit Trail</p>
            <p className="text-xs text-slate-500">Last scan: 2 hours ago</p>
          </div>
        </div>
        <span className="text-sm font-bold text-blue-600">2.4TB</span>
      </div>
    </div>
  </div>
)

// Icon component for credit card (since it's not imported above)
const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

// Main Page Component
export default function AuditLogsPage() {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<SecurityEvent[]>(mockSecurityEvents)
  const [metrics, setMetrics] = useState<SecurityMetrics>(mockMetrics)
  const [fingerprints, setFingerprints] = useState<DeviceFingerprint[]>(mockFingerprints)

  const filteredEvents = events.filter(event => {
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory
    const matchesSearch = searchQuery === '' || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery)
    return matchesSeverity && matchesCategory && matchesSearch
  })

  const acknowledgeEvent = (eventId: string) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, acknowledged: true } : e))
  }

  const escalateEvent = (eventId: string) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, escalated: true } : e))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              AI Security Command Center
            </h1>
            <p className="text-slate-500 mt-1">Real-time threat detection, system fingerprinting & compliance monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Security Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <SecurityMetricCard
            title="Security Score"
            value={`${metrics.securityScore}%`}
            icon={ShieldCheck}
            trend="up"
            color="border-emerald-500"
            subtitle="Overall platform health"
          />
          <SecurityMetricCard
            title="Active Threats"
            value={metrics.activeThreats}
            icon={ShieldAlert}
            trend="down"
            color="border-red-500"
            subtitle="Requiring attention"
          />
          <SecurityMetricCard
            title="Failed Logins"
            value={metrics.failedLogins24h}
            icon={Lock}
            trend="neutral"
            color="border-orange-500"
            subtitle="Last 24 hours"
          />
          <SecurityMetricCard
            title="Blocked Attacks"
            value={metrics.blockedAttacks}
            icon={Ban}
            trend="up"
            color="border-blue-500"
            subtitle="Successfully defended"
          />
          <SecurityMetricCard
            title="Critical Alerts"
            value={metrics.criticalAlerts}
            icon={AlertOctagon}
            color="border-red-600"
            subtitle="Immediate action needed"
          />
          <SecurityMetricCard
            title="System Health"
            value={`${metrics.systemHealth}%`}
            icon={Activity}
            trend="up"
            color="border-emerald-500"
            subtitle="All systems operational"
          />
        </div>

        {/* AI Intelligence & Threat Map Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AIThreatPanel />
          <ThreatMap />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, users, IPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="authorization">Authorization</option>
              <option value="data_access">Data Access</option>
              <option value="attack">Attack</option>
              <option value="anomaly">Anomaly</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Live updates enabled</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Security Events Feed */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Terminal className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Security Event Log</h3>
                    <p className="text-xs text-slate-500">{filteredEvents.length} events found</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Filter className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {filteredEvents.map((event) => (
                    <SecurityEventRow 
                      key={event.id} 
                      event={event} 
                      onSelect={setSelectedEvent}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar Panels */}
          <div className="space-y-6">
            <FingerprintPanel fingerprints={fingerprints} />
            <CompliancePanel />
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityBadge(selectedEvent.severity)}`}>
                      {getCategoryIcon(selectedEvent.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Security Event Details</h3>
                      <p className="text-xs text-slate-500">ID: {selectedEvent.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Event Details */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Description</h4>
                    <p className="text-slate-600">{selectedEvent.description}</p>
                  </div>
                  
                  {/* AI Analysis */}
                  {selectedEvent.aiAnalysis && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-slate-800">AI Analysis</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Threat Category</span>
                          <span className="text-sm font-medium text-purple-600">{selectedEvent.aiAnalysis.threatCategory}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Confidence</span>
                          <span className="text-sm font-medium text-purple-600">{(selectedEvent.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Anomaly Score</span>
                          <span className="text-sm font-medium text-purple-600">{selectedEvent.aiAnalysis.anomalyScore}/100</span>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600">Risk Factors:</span>
                          <ul className="mt-1 space-y-1">
                            {selectedEvent.aiAnalysis.riskFactors.map((factor, idx) => (
                              <li key={idx} className="text-xs text-slate-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-purple-200">
                          <span className="text-sm font-medium text-slate-700">Recommendation:</span>
                          <p className="text-sm text-slate-600 mt-1">{selectedEvent.aiAnalysis.recommendedAction}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Technical Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-800 mb-2">User Information</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-600"><span className="text-slate-400">User:</span> {selectedEvent.userName || 'N/A'}</p>
                        <p className="text-slate-600"><span className="text-slate-400">ID:</span> {selectedEvent.userId || 'N/A'}</p>
                        <p className="text-slate-600"><span className="text-slate-400">IP:</span> {selectedEvent.ipAddress}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-2">Event Details</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-600"><span className="text-slate-400">Category:</span> {selectedEvent.category}</p>
                        <p className="text-slate-600"><span className="text-slate-400">Severity:</span> <span className={`px-2 py-0.5 rounded text-xs ${getSeverityBadge(selectedEvent.severity)}`}>{selectedEvent.severity}</span></p>
                        <p className="text-slate-600"><span className="text-slate-400">Time:</span> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location */}
                  {selectedEvent.geolocation && (
                    <div>
                      <h4 className="font-medium text-slate-800 mb-2">Geolocation</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {selectedEvent.geolocation.city}, {selectedEvent.geolocation.country}
                        <span className="text-slate-400">({selectedEvent.geolocation.lat.toFixed(2)}, {selectedEvent.geolocation.lng.toFixed(2)})</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    {!selectedEvent.acknowledged && (
                      <button 
                        onClick={() => {
                          acknowledgeEvent(selectedEvent.id)
                          setSelectedEvent(null)
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge
                      </button>
                    )}
                    {!selectedEvent.escalated && (
                      <button 
                        onClick={() => {
                          escalateEvent(selectedEvent.id)
                          setSelectedEvent(null)
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Escalate
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
      </div>
    </div>
  )
}
