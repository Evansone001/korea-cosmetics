import { NextRequest, NextResponse } from 'next/server'

const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload API] Upload request received')
    
    // Get the form data from the request
    const formData = await request.formData()
    
    // Extract auth token from incoming request
    const authToken = request.cookies.get('auth-token')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      console.error('[Upload API] No auth token found in request')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('[Upload API] Forwarding auth token to backend, token length:', authToken.length)
    console.log('[Upload API] Backend URL:', FLASK_BACKEND_URL)

    // Forward to Flask backend with auth token in Authorization header
    const backendUrl = `${FLASK_BACKEND_URL}/api/products/upload`
    console.log('[Upload API] Fetching from:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // Don't set Content-Type for FormData - let fetch set it with boundary
      },
      body: formData,
    })

    console.log('[Upload API] Backend response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
      console.error('[Upload API] Backend returned error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    
    // Convert relative URL to full URL for frontend
    if (data.url && data.url.startsWith('/')) {
      data.url = `${FLASK_BACKEND_URL}${data.url}`
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('[Upload API] Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}
