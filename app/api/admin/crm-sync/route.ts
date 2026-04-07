import { NextResponse } from 'next/server';
import { crmService } from '@/lib/services/crmIntegration';

// POST - Manually trigger sync for specific entity
export async function POST(request: Request) {
  try {
    const { entityType, entityData } = await request.json();

    if (!entityType || !entityData) {
      return NextResponse.json(
        { error: 'Missing entityType or entityData' },
        { status: 400 }
      );
    }

    let result = false;

    switch (entityType) {
      case 'customer':
        result = await crmService.syncCustomer(entityData);
        break;
      case 'order':
        result = await crmService.syncOrder(entityData);
        break;
      case 'product':
        result = await crmService.syncProduct(entityData);
        break;
      case 'store':
        result = await crmService.syncStore(entityData);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown entity type: ${entityType}` },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `${entityType} synced to CRM`,
      });
    } else {
      return NextResponse.json(
        { error: 'Sync failed - check CRM configuration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('CRM sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to CRM' },
      { status: 500 }
    );
  }
}
