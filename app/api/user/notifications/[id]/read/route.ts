import { NextRequest, NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://127.0.0.1:5000'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieHeader = request.headers.get('cookie') || ''
    const authMatch = cookieHeader.match(/auth-token=([^;]+)/)
    const authToken = authMatch?.[1]

    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
        `${FLASK_BACKEND_URL}/api/user/notifications/${id}/mark-read`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
}
