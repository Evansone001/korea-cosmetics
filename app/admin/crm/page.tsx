'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Link2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Webhook,
  Shield,
  Send,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CRMConfig {
  enabled: boolean;
  webhookUrl: string | null;
  syncEvents: string[];
  configured: boolean;
}

const AVAILABLE_EVENTS = [
  { value: 'customer.created', label: 'Customer Created', description: 'When a new user registers' },
  { value: 'customer.updated', label: 'Customer Updated', description: 'When customer profile changes' },
  { value: 'order.created', label: 'Order Created', description: 'When a new order is placed' },
  { value: 'order.updated', label: 'Order Updated', description: 'When order status changes' },
  { value: 'order.paid', label: 'Order Paid', description: 'When payment is confirmed' },
  { value: 'product.created', label: 'Product Created', description: 'When store adds a product' },
  { value: 'store.approved', label: 'Store Approved', description: 'When a store is verified' },
];

export default function CRMIntegrationPage() {
  const [config, setConfig] = useState<CRMConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/crm-config', {
        credentials: 'include',
      });
      const data = await response.json();
      setConfig(data);
      
      // Initialize form
      if (data.webhookUrl) {
        setWebhookUrl(data.webhookUrl.replace('****', ''));
      }
      setEnabled(data.enabled);
      setSelectedEvents(data.syncEvents || []);
    } catch (error) {
      toast.error('Failed to load CRM configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/crm-config', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          apiKey,
          enabled,
          syncEvents: selectedEvents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchConfig();
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      toast.error('Failed to save CRM configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/admin/crm-sync', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'customer',
          entityData: {
            id: 'test_123',
            name: 'Test User',
            email: 'test@example.com',
            createdAt: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Test webhook sent successfully!');
      } else {
        toast.error(data.error || 'Test failed');
      }
    } catch (error) {
      toast.error('Test failed - check console for details');
    } finally {
      setTesting(false);
    }
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM Integration</h1>
          <p className="text-slate-500 mt-1">Connect KoreaCosmetics' Hub with your custom CRM system</p>
        </div>
        <div className="flex items-center gap-2">
          {config?.configured && (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              config?.enabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }}`}>
              {config?.enabled ? (
                <><CheckCircle2 size={16} /> Connected</>
              ) : (
                <><XCircle size={16} /> Disabled</>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            config?.enabled 
              ? 'bg-green-100 text-green-600' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            <Link2 size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Connection Status</h3>
            <p className="text-sm text-slate-500 mt-1">
              {config?.configured 
                ? `Your CRM is ${config?.enabled ? 'connected and receiving webhooks' : 'configured but disabled'}`
                : 'Configure your CRM webhook URL to start syncing data'
              }
            </p>
            {config?.webhookUrl && (
              <code className="mt-2 inline-block bg-slate-100 px-3 py-1 rounded text-sm text-slate-700">
                {config.webhookUrl}
              </code>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="text-slate-400" size={20} />
          <h3 className="font-semibold text-slate-900">Configuration</h3>
        </div>

        {/* Webhook URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Webhook URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-crm.com/api/webhooks/KoreaCosmetics'"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500">
            Your CRM endpoint that receives webhook events
          </p>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            API Key <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="your-crm-api-key"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500">
            Authentication key sent in X-API-Key header
          </p>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-6 rounded-full relative transition-colors ${
              enabled ? 'bg-green-500' : 'bg-slate-300'
            }`}>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-slate-900">Enable CRM Sync</p>
              <p className="text-sm text-slate-500">Automatically push data to your CRM</p>
            </div>
          </div>
        </div>

        {/* Event Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Sync Events</label>
          <p className="text-xs text-slate-500">Select which events to send to your CRM</p>
          
          <div className="grid sm:grid-cols-2 gap-3">
            {AVAILABLE_EVENTS.map((event) => (
              <label
                key={event.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEvents.includes(event.value)
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event.value)}
                  onChange={() => toggleEvent(event.value)}
                  className="mt-0.5 w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{event.label}</p>
                  <p className="text-xs text-slate-500">{event.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook Payload Documentation */}
      <div className="bg-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={20} className="text-slate-400" />
          <h3 className="font-semibold">Webhook Payload Format</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Your CRM will receive POST requests with this JSON structure:
        </p>
        <pre className="bg-slate-800 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "event": "order.created",
  "timestamp": "2026-04-03T16:30:00.000Z",
  "data": {
    "type": "deal",
    "id": "order_123",
    "customerId": "cust_456",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "total": 299.99,
    "status": "pending",
    "items": [...],
    "createdAt": "2026-04-03T16:30:00.000Z"
  }
}`}
        </pre>
        <div className="mt-4 text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-2">Headers:</p>
          <ul className="space-y-1 text-xs font-mono">
            <li>Content-Type: application/json</li>
            <li>X-API-Key: your-api-key</li>
            <li>X-Event-Type: order.created</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !webhookUrl || !apiKey}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <><RefreshCw size={18} className="animate-spin" /> Saving...</>
          ) : (
            <><Settings size={18} /> Save Configuration</>
          )}
        </button>
        
        <button
          onClick={handleTest}
          disabled={testing || !config?.enabled}
          className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:border-slate-900 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {testing ? (
            <><RefreshCw size={18} className="animate-spin" /> Testing...</>
          ) : (
            <><Send size={18} /> Test Webhook</>
          )}
        </button>
      </div>
    </div>
  );
}
