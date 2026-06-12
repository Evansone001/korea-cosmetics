import { NextRequest, NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000'

export async function GET(request: NextRequest) {
    const cookieHeader = request.headers.get('cookie') || ''
    const authMatch = cookieHeader.match(/auth-token=([^;]+)/)
    const authToken = authMatch?.[1]

    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'
    const unreadOnly = searchParams.get('unread_only') || 'false'

    const response = await fetch(
        `${FLASK_BACKEND_URL}/api/user/notifications?limit=${limit}&unread_only=${unreadOnly}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            cache: 'no-store',
        }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
}
