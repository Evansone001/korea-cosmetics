import { NextResponse } from 'next/server'
import { aiEngine } from '@/lib/services/aiEngine'

// GET /api/admin/ai - Get AI insights, forecasts, and status
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        switch (action) {
            case 'forecast': {
                const type = searchParams.get('type') as 'sales' | 'revenue' | 'demand' | 'inventory' || 'sales'
                const horizon = searchParams.get('horizon') as '7d' | '30d' | '90d' || '30d'
                const forecast = await aiEngine.generateForecast(type, horizon)
                return NextResponse.json({ success: true, data: forecast })
            }

            case 'insights': {
                const insights = await aiEngine.generateInsights()
                return NextResponse.json({ success: true, data: insights })
            }

            case 'anomalies': {
                const anomalies = await aiEngine.detectAnomalies()
                return NextResponse.json({ success: true, data: anomalies })
            }

            case 'sentiment': {
                const sentiment = await aiEngine.analyzeSentiment()
                return NextResponse.json({ success: true, data: sentiment })
            }

            case 'inventory': {
                const predictions = await aiEngine.predictInventory()
                return NextResponse.json({ success: true, data: predictions })
            }

            case 'models': {
                const models = aiEngine.getModels()
                return NextResponse.json({ success: true, data: models })
            }

            case 'settings': {
                const settings = aiEngine.getSettings()
                return NextResponse.json({ success: true, data: settings })
            }

            case 'status': {
                const models = aiEngine.getModels()
                const settings = aiEngine.getSettings()
                return NextResponse.json({
                    success: true,
                    data: {
                        enabled: settings.enabled,
                        activeModels: models.filter(m => m.status === 'active').length,
                        totalModels: models.length,
                        features: settings.features
                    }
                })
            }

            default: {
                // Return comprehensive AI dashboard data
                const [insights, anomalies, sentiment, predictions, models] = await Promise.all([
                    aiEngine.generateInsights(),
                    aiEngine.detectAnomalies(),
                    aiEngine.analyzeSentiment(),
                    aiEngine.predictInventory(),
                    Promise.resolve(aiEngine.getModels())
                ])

                return NextResponse.json({
                    success: true,
                    data: {
                        insights,
                        anomalies,
                        sentiment,
                        inventory: predictions,
                        models,
                        summary: {
                            activeInsights: insights.length,
                            activeAnomalies: anomalies.filter(a => a.status === 'active').length,
                            sentimentScore: sentiment.overall.score,
                            atRiskInventory: predictions.filter(p => p.predictedStockout).length
                        }
                    }
                })
            }
        }
    } catch (error) {
        console.error('AI API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to process AI request' },
            { status: 500 }
        )
    }
}

// POST /api/admin/ai - Process AI queries and actions
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action, data } = body

        switch (action) {
            case 'query': {
                // Natural language query processing
                const response = await aiEngine.processNLQuery(data)
                return NextResponse.json({ success: true, data: response })
            }

            case 'forecast': {
                const { type, horizon } = data
                const forecast = await aiEngine.generateForecast(type, horizon)
                return NextResponse.json({ success: true, data: forecast })
            }

            case 'retrain': {
                const { modelId } = data
                // Simulate model retraining
                return NextResponse.json({
                    success: true,
                    data: {
                        modelId,
                        status: 'training',
                        estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                        message: 'Model retraining started successfully'
                    }
                })
            }

            case 'updateSettings': {
                aiEngine.updateSettings(data)
                return NextResponse.json({
                    success: true,
                    data: { message: 'Settings updated successfully' }
                })
            }

            case 'dismissAnomaly': {
                const { anomalyId } = data
                return NextResponse.json({
                    success: true,
                    data: { anomalyId, status: 'dismissed' }
                })
            }

            case 'generateReport': {
                const { type, period } = data
                const insights = await aiEngine.generateInsights()
                const anomalies = await aiEngine.detectAnomalies()

                return NextResponse.json({
                    success: true,
                    data: {
                        id: `report_${Date.now()}`,
                        type,
                        period,
                        generatedAt: new Date().toISOString(),
                        insights: insights.slice(0, 5),
                        anomalies: anomalies.slice(0, 3),
                        summary: 'AI-generated report with key insights and anomalies detected.'
                    }
                })
            }

            default:
                return NextResponse.json(
                    { success: false, error: 'Unknown action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('AI API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to process AI request' },
            { status: 500 }
        )
    }
}
