'use client'

import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react'

interface MetricSummary {
  totalRevenue: number
  b2bRevenue: number
  b2cRevenue: number
  totalOrders: number
  b2bOrders: number
  b2cOrders: number
  avgOrderValue: number
}

interface InsightPanelProps {
  metrics: MetricSummary
  currency: string
}

export function InsightPanel({ metrics, currency }: InsightPanelProps) {
  const insights = generateInsights(metrics, currency)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-slate-800">Business Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className={`mt-0.5 ${insight.color}`}>
              {insight.icon}
            </div>
            <div>
              <p className="text-sm text-slate-700 font-medium">{insight.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>

      {metrics.totalRevenue === 0 && metrics.b2bRevenue === 0 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <AlertCircle size={16} />
            <span>No transaction data available for the selected period.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function generateInsights(metrics: MetricSummary, currency: string) {
  const insights: { icon: React.ReactNode; title: string; description: string; color: string }[] = []

  // Revenue mix insight
  if (metrics.totalRevenue > 0) {
    const b2bPercentage = (metrics.b2bRevenue / metrics.totalRevenue) * 100
    const b2cPercentage = (metrics.b2cRevenue / metrics.totalRevenue) * 100

    if (b2bPercentage > 80) {
      insights.push({
        icon: <Target size={16} />,
        title: 'B2B-Driven Business',
        description: `${Math.round(b2bPercentage)}% of revenue comes from wholesale (B2B). Consider expanding B2B product lines.`,
        color: 'text-indigo-600'
      })
    } else if (b2cPercentage > 80) {
      insights.push({
        icon: <Target size={16} />,
        title: 'B2C-Focused Sales',
        description: `${Math.round(b2cPercentage)}% of revenue is retail (B2C). Wholesale opportunities may be untapped.`,
        color: 'text-sky-600'
      })
    } else {
      insights.push({
        icon: <TrendingUp size={16} />,
        title: 'Balanced Revenue Mix',
        description: `Healthy diversification: ${Math.round(b2bPercentage)}% B2B, ${Math.round(b2cPercentage)}% B2C.`,
        color: 'text-emerald-600'
      })
    }
  }

  // AOV insight
  if (metrics.avgOrderValue > 0) {
    let aovInsight = {
      icon: <TrendingUp size={16} />,
      title: 'Average Order Value',
      description: ``,
      color: 'text-slate-600'
    }

    if (metrics.avgOrderValue > 500) {
      aovInsight.description = `Strong AOV of ${currency}${metrics.avgOrderValue.toFixed(0)} indicates healthy transaction sizes.`
      aovInsight.color = 'text-emerald-600'
    } else if (metrics.avgOrderValue > 200) {
      aovInsight.description = `Average order value of ${currency}${metrics.avgOrderValue.toFixed(0)}. Consider upselling strategies.`
    } else {
      aovInsight.description = `Low AOV of ${currency}${metrics.avgOrderValue.toFixed(0)}. Bundle offers may increase cart values.`
      aovInsight.color = 'text-amber-600'
    }
    insights.push(aovInsight)
  }

  // Order volume insight
  if (metrics.totalOrders > 0) {
    if (metrics.totalOrders < 5) {
      insights.push({
        icon: <TrendingDown size={16} />,
        title: 'Low Order Volume',
        description: `${metrics.totalOrders} orders in this period. Marketing campaigns may help drive more traffic.`,
        color: 'text-amber-600'
      })
    } else if (metrics.totalOrders > 20) {
      insights.push({
        icon: <TrendingUp size={16} />,
        title: 'Strong Order Flow',
        description: `${metrics.totalOrders} orders show healthy transaction activity.`,
        color: 'text-emerald-600'
      })
    }
  }

  return insights
}
