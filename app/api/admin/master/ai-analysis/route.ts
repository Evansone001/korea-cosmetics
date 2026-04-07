import { NextRequest, NextResponse } from 'next/server'
import { masterAdminService } from '@/lib/services/masterAdmin'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storeId?: string }> }
) {
    try {
        const { storeId } = await params
        
        // Check if this is a store-specific analysis request
        if (storeId) {
            const analysis = await masterAdminService.getStoreAIAnalysis(storeId)
            return NextResponse.json(analysis)
        }
        
        // Default: platform-wide AI insights
        const insights = await masterAdminService.getPlatformAIInsights()
        return NextResponse.json(insights)
    } catch (error) {
        console.error('Error fetching AI data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch AI data' },
            { status: 500 }
        )
    }
}
