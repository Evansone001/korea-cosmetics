'use client'
import { useState, useEffect } from 'react'
import { 
    Brain, TrendingUp, AlertTriangle, MessageSquare, 
    BarChart3, Settings, Play, Pause, RefreshCw, 
    CheckCircle, Clock, Activity, Zap, Filter,
    Download, Send, Sparkles, ChevronDown, Bot
} from 'lucide-react'
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts'
import { aiEngine } from '@/lib/services/aiEngine'
import { 
    AIForecast, AIInsight, AIAnomaly, AIModelConfig,
    SentimentAnalysis, AIQueryResponse 
} from '@/lib/types/ai'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AIAnalyticsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'insights' | 'anomalies' | 'settings'>('overview')
    const [forecasts, setForecasts] = useState<AIForecast[]>([])
    const [insights, setInsights] = useState<AIInsight[]>([])
    const [anomalies, setAnomalies] = useState<AIAnomaly[]>([])
    const [models, setModels] = useState<AIModelConfig[]>([])
    const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [nlQuery, setNlQuery] = useState('')
    const [nlResponse, setNlResponse] = useState<AIQueryResponse | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [anomalySensitivity, setAnomalySensitivity] = useState('medium')
    const [minConfidence, setMinConfidence] = useState(75)
    const [schedules, setSchedules] = useState({
        'Forecast Update': 'daily',
        'Sentiment Analysis': 'daily',
        'Anomaly Check': 'hourly'
    })

    useEffect(() => {
        loadAIData()
    }, [])

    const loadAIData = async () => {
        setLoading(true)
        try {
            const [forecastData, insightData, anomalyData, modelData, sentimentData] = await Promise.all([
                aiEngine.generateForecast('sales', '30d'),
                aiEngine.generateInsights(),
                aiEngine.detectAnomalies(),
                Promise.resolve(aiEngine.getModels()),
                aiEngine.analyzeSentiment()
            ])
            
            setForecasts([forecastData])
            setInsights(insightData)
            setAnomalies(anomalyData)
            setModels(modelData)
            setSentiment(sentimentData)
        } catch (error) {
            console.error('Error loading AI data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNLQuery = async () => {
        if (!nlQuery.trim()) return
        
        setIsProcessing(true)
        try {
            const response = await aiEngine.processNLQuery({ 
                query: nlQuery,
                timeframe: 'month'
            })
            setNlResponse(response)
        } catch (error) {
            console.error('Error processing query:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const generateNewForecast = async (type: 'sales' | 'revenue' | 'demand' | 'inventory') => {
        setLoading(true)
        try {
            const newForecast = await aiEngine.generateForecast(type, '30d')
            setForecasts(prev => [...prev.filter(f => f.type !== type), newForecast])
        } catch (error) {
            console.error('Error generating forecast:', error)
        } finally {
            setLoading(false)
        }
    }

    const dismissAnomaly = (id: string) => {
        setAnomalies(prev => prev.map(a => 
            a.id === id ? { ...a, status: 'dismissed' as const } : a
        ))
    }

    const investigateAnomaly = (id: string) => {
        setAnomalies(prev => prev.map(a => 
            a.id === id ? { ...a, status: 'investigating' as const } : a
        ))
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">AI Analytics Center</h1>
                    </div>
                    <p className="text-slate-500">Advanced AI-powered insights and predictive analytics for your business</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={loadAIData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Refresh Data</span>
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">AI Engine Active</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'models', label: 'AI Models', icon: Brain },
                    { id: 'insights', label: 'Insights', icon: Sparkles },
                    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === tab.id 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* AI Query Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Bot className="w-6 h-6" />
                            <h2 className="text-lg font-bold">Ask AI Analytics</h2>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={nlQuery}
                                onChange={(e) => setNlQuery(e.target.value)}
                                placeholder="e.g., What are my top selling products? Predict next month's revenue. Show inventory risks..."
                                className="flex-1 px-4 py-3 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                                onKeyDown={(e) => e.key === 'Enter' && handleNLQuery()}
                            />
                            <button
                                onClick={handleNLQuery}
                                disabled={isProcessing || !nlQuery.trim()}
                                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Ask AI
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {['Top products this week', 'Sales forecast', 'Inventory alerts', 'Customer sentiment', 'Revenue trend'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setNlQuery(suggestion)}
                                    className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Query Response */}
                    {nlResponse && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-slate-800">AI Response</h3>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                        {Math.round(nlResponse.confidence * 100)}% confidence
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setNlResponse(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-slate-700 mb-4">{nlResponse.result.explanation}</p>
                            {nlResponse.result.type === 'metric' && (
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <div className="text-3xl font-bold text-slate-800">
                                        KShs {nlResponse.result.data.value?.toLocaleString()}
                                    </div>
                                    <div className={`text-sm mt-1 ${nlResponse.result.data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {nlResponse.result.data.change > 0 ? '+' : ''}{nlResponse.result.data.change}% vs last period
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Forecasts */}
                    {forecasts.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {forecasts.map((forecast) => (
                                <div key={forecast.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-800 capitalize">{forecast.type} Forecast</h3>
                                            <p className="text-sm text-slate-500">Next {forecast.horizon} • {Math.round(forecast.confidence * 100)}% confidence</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => generateNewForecast(forecast.type)}
                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={forecast.data.slice(0, 14)}>
                                                <defs>
                                                    <linearGradient id={`color${forecast.type}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                    formatter={(value: number) => [value.toLocaleString(), 'Predicted']}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="predicted" 
                                                    stroke="#3b82f6" 
                                                    fill={`url(#color${forecast.type})`}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}

                            {/* Sentiment Overview */}
                            {sentiment && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">Customer Sentiment</h3>
                                            <p className="text-sm text-slate-500">Based on {sentiment.sampleSize} reviews</p>
                                        </div>
                                        <MessageSquare className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Positive', value: sentiment.overall.positive },
                                                        { name: 'Neutral', value: sentiment.overall.neutral },
                                                        { name: 'Negative', value: sentiment.overall.negative }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    dataKey="value"
                                                >
                                                    <Cell fill="#10b981" />
                                                    <Cell fill="#94a3b8" />
                                                    <Cell fill="#ef4444" />
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <div className="text-lg font-bold text-green-600">{sentiment.overall.positive}%</div>
                                            <div className="text-xs text-slate-500">Positive</div>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <div className="text-lg font-bold text-slate-600">{sentiment.overall.neutral}%</div>
                                            <div className="text-xs text-slate-500">Neutral</div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <div className="text-lg font-bold text-red-600">{sentiment.overall.negative}%</div>
                                            <div className="text-xs text-slate-500">Negative</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Models Tab */}
            {activeTab === 'models' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {models.map((model) => (
                            <div key={model.id} className="bg-white rounded-xl border border-slate-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            model.status === 'active' ? 'bg-green-100 text-green-600' :
                                            model.status === 'training' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            <Brain className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{model.name}</h3>
                                            <p className="text-sm text-slate-500">v{model.version}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        model.status === 'active' ? 'bg-green-100 text-green-700' :
                                        model.status === 'training' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                        {model.status}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Accuracy</span>
                                        <span className="font-medium text-slate-800">{Math.round(model.accuracy * 100)}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Training Data</span>
                                        <span className="font-medium text-slate-800">{model.trainingDataSize.toLocaleString()} samples</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Last Trained</span>
                                        <span className="font-medium text-slate-800">{new Date(model.lastTrainedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100">
                                        <p className="text-xs text-slate-500 mb-2">Features:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {model.config.features.slice(0, 4).map((feature) => (
                                                <span key={feature} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                        Retrain Model
                                    </button>
                                    <button className="px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
                <div className="space-y-4">
                    {insights.map((insight) => (
                        <div key={insight.id} className={`bg-white rounded-xl border p-6 ${
                            insight.severity === 'high' ? 'border-red-200 bg-red-50/30' :
                            insight.severity === 'medium' ? 'border-orange-200 bg-orange-50/30' :
                            insight.severity === 'low' ? 'border-blue-200 bg-blue-50/30' :
                            'border-slate-200'
                        }`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            insight.category === 'trend' ? 'bg-blue-100 text-blue-700' :
                                            insight.category === 'anomaly' ? 'bg-orange-100 text-orange-700' :
                                            insight.category === 'opportunity' ? 'bg-green-100 text-green-700' :
                                            insight.category === 'risk' ? 'bg-red-100 text-red-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                            {insight.category}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {Math.round(insight.confidence * 100)}% confidence
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-2">{insight.title}</h3>
                                    <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                                    {insight.actionable && insight.suggestedAction && (
                                        <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-slate-200">
                                            <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Suggested Action:</p>
                                                <p className="text-sm text-slate-600">{insight.suggestedAction}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <span className={`w-2 h-2 rounded-full ${
                                        insight.severity === 'high' ? 'bg-red-500' :
                                        insight.severity === 'medium' ? 'bg-orange-500' :
                                        insight.severity === 'low' ? 'bg-blue-500' :
                                        'bg-slate-400'
                                    }`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Anomalies Tab */}
            {activeTab === 'anomalies' && (
                <div className="space-y-4">
                    {anomalies.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Anomalies Detected</h3>
                            <p className="text-slate-500">Your metrics are within normal ranges. AI is continuously monitoring...</p>
                        </div>
                    ) : (
                        anomalies.map((anomaly) => (
                            <div key={anomaly.id} className={`bg-white rounded-xl border p-6 ${
                                anomaly.severity === 'critical' ? 'border-red-300' :
                                anomaly.severity === 'high' ? 'border-red-200' :
                                anomaly.severity === 'medium' ? 'border-orange-200' :
                                'border-yellow-200'
                            }`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${
                                                anomaly.severity === 'critical' ? 'bg-red-100 text-red-600' :
                                                anomaly.severity === 'high' ? 'bg-red-100 text-red-600' :
                                                anomaly.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800 capitalize">{anomaly.type.replace('_', ' ')}</h3>
                                                <p className="text-xs text-slate-500">Detected {new Date(anomaly.detectedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">{anomaly.description}</p>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div>
                                                <span className="text-slate-500">Expected:</span>
                                                <span className="ml-1 font-medium text-slate-700">{anomaly.expectedValue}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Actual:</span>
                                                <span className={`ml-1 font-medium ${anomaly.deviation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {anomaly.actualValue}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Deviation:</span>
                                                <span className={`ml-1 font-medium ${Math.abs(anomaly.deviation) > 50 ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {anomaly.status === 'active' && (
                                            <>
                                                <button 
                                                    onClick={() => investigateAnomaly(anomaly.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    Investigate
                                                </button>
                                                <button 
                                                    onClick={() => dismissAnomaly(anomaly.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Dismiss
                                                </button>
                                            </>
                                        )}
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            anomaly.status === 'active' ? 'bg-red-100 text-red-700' :
                                            anomaly.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                                            anomaly.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {anomaly.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-4">AI Features</h3>
                            <div className="space-y-3">
                                {[
                                    { key: 'forecasting', label: 'Sales Forecasting', desc: 'Predict future sales and revenue' },
                                    { key: 'sentiment', label: 'Sentiment Analysis', desc: 'Analyze customer reviews and feedback' },
                                    { key: 'anomaly', label: 'Anomaly Detection', desc: 'Detect unusual patterns in data' },
                                    { key: 'recommendations', label: 'Smart Recommendations', desc: 'Product and pricing suggestions' },
                                    { key: 'autoReports', label: 'Automated Reports', desc: 'Generate periodic AI reports' }
                                ].map((feature) => (
                                    <div key={feature.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-slate-800">{feature.label}</p>
                                            <p className="text-sm text-slate-500">{feature.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-4">Alert Thresholds</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Anomaly Sensitivity</label>
                                    <select 
                                        value={anomalySensitivity}
                                        onChange={(e) => setAnomalySensitivity(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="low">Low - Only major anomalies</option>
                                        <option value="medium">Medium - Balanced detection</option>
                                        <option value="high">High - Detect subtle changes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Confidence (%)</label>
                                    <input 
                                        type="number" 
                                        defaultValue={75} 
                                        min={50} 
                                        max={95}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-4">Data Refresh Schedule</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Forecast Update', default: 'daily' },
                                    { label: 'Sentiment Analysis', default: 'daily' },
                                    { label: 'Anomaly Check', default: 'hourly' }
                                ].map((schedule) => (
                                    <div key={schedule.label} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">{schedule.label}</span>
                                        <select 
                                            value={schedules[schedule.label as keyof typeof schedules]}
                                            onChange={(e) => setSchedules(prev => ({
                                                ...prev,
                                                [schedule.label]: e.target.value
                                            }))}
                                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="realtime">Real-time</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 flex gap-3">
                            <button className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                                Save Settings
                            </button>
                            <button className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                                Reset to Default
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
