'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface KpiCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  sparklineData?: { value: number }[]
  color: 'blue' | 'indigo' | 'emerald' | 'amber' | 'purple'
  icon?: React.ReactNode
}

const colorMap = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-700',
    accent: 'text-blue-600',
    stroke: '#3b82f6',
    fill: '#3b82f6'
  },
  indigo: {
    bg: 'from-indigo-50 to-indigo-100',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    accent: 'text-indigo-600',
    stroke: '#6366f1',
    fill: '#6366f1'
  },
  emerald: {
    bg: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    accent: 'text-emerald-600',
    stroke: '#10b981',
    fill: '#10b981'
  },
  amber: {
    bg: 'from-amber-50 to-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-700',
    accent: 'text-amber-600',
    stroke: '#f59e0b',
    fill: '#f59e0b'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-700',
    accent: 'text-purple-600',
    stroke: '#8b5cf6',
    fill: '#8b5cf6'
  }
}

export function KpiCard({ title, value, change, changeLabel, sparklineData, color, icon }: KpiCardProps) {
  const colors = colorMap[color]
  const isPositive = change && change > 0
  const isNegative = change && change < 0
  const isNeutral = change === 0 || change === undefined

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-xl p-4 border ${colors.border} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-medium ${colors.accent} uppercase tracking-wider`}>{title}</span>
        {icon && <div className={`${colors.text}`}>{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-slate-800">{value}</div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
              isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-500'
            }`}>
              {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
              <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
              {changeLabel && <span className="text-slate-400 ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        
        {sparklineData && sparklineData.length > 1 && (
          <div className="w-16 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`sparkline-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.fill} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.fill} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.stroke}
                  strokeWidth={2}
                  fill={`url(#sparkline-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
