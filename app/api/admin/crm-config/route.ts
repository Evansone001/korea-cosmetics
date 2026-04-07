import { NextResponse } from 'next/server';
import { crmService, CRMConfig } from '@/lib/services/crmIntegration';

// GET - Retrieve current CRM configuration
export async function GET() {
  const config = crmService.getConfig();
  
  // Return config without sensitive data
  return NextResponse.json({
    enabled: config?.enabled ?? false,
    webhookUrl: config?.webhookUrl ? maskUrl(config.webhookUrl) : null,
    syncEvents: config?.syncEvents ?? [],
    configured: !!config?.webhookUrl,
  });
}

// POST - Update CRM configuration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webhookUrl, apiKey, enabled, syncEvents } = body;

    // Validate
    if (webhookUrl && !isValidUrl(webhookUrl)) {
      return NextResponse.json(
        { error: 'Invalid webhook URL' },
        { status: 400 }
      );
    }

    const config: CRMConfig = {
      webhookUrl: webhookUrl || crmService.getConfig()?.webhookUrl || '',
      apiKey: apiKey || crmService.getConfig()?.apiKey || '',
      enabled: enabled ?? false,
      syncEvents: syncEvents || [
        'customer.created',
        'order.created',
        'order.paid',
      ],
    };

    crmService.setConfig(config);

    // Test the connection if enabling
    if (enabled && webhookUrl) {
      const testResult = await testCRMConnection(config);
      if (!testResult.success) {
        return NextResponse.json(
          { error: 'Failed to connect to CRM', details: testResult.error },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: enabled ? 'CRM integration enabled' : 'CRM integration disabled',
      configured: true,
    });
  } catch (error) {
    console.error('CRM config error:', error);
    return NextResponse.json(
      { error: 'Failed to update CRM configuration' },
      { status: 500 }
    );
  }
}

// DELETE - Clear CRM configuration
export async function DELETE() {
  crmService.setConfig({
    webhookUrl: '',
    apiKey: '',
    enabled: false,
    syncEvents: [],
  });

  return NextResponse.json({
    success: true,
    message: 'CRM configuration cleared',
  });
}

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}/****`;
  } catch {
    return '****';
  }
}

async function testCRMConnection(config: CRMConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        'X-Event-Type': 'test',
      },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'Connection test from KoreaBeauty Hub' },
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
