'use client';

import { useState, useEffect } from 'react';
import { Truck, X, Copy, ExternalLink, Bike, RefreshCw, Clock, MapPin, Phone, Package } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface Carrier {
  code: string;
  name: string;
  description: string;
  icon: string;
  sameDay: boolean;
  riderManagement: boolean;
  coverage: string;
}

interface ShipOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  storeName: string;
  onShipped: () => void;
}

export default function ShipOrderModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  storeName,
  onShipped
}: ShipOrderModalProps) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('BODA');
  const [riderCode, setRiderCode] = useState<string>('');
  const [riderPhone, setRiderPhone] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<string>('same_day');
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [carriersLoading, setCarriersLoading] = useState(true);

  // Load carriers on mount
  useEffect(() => {
    if (isOpen) {
      loadCarriers();
    }
  }, [isOpen]);

  // Generate tracking number when carrier or rider code changes
  useEffect(() => {
    if (isOpen && selectedCarrier) {
      handleGenerateTracking();
    }
  }, [selectedCarrier, riderCode]);

  // Set default estimated time for same-day delivery
  useEffect(() => {
    if (deliveryType === 'same_day' && !estimatedTime) {
      const now = new Date();
      now.setHours(now.getHours() + 4);
      setEstimatedTime(now.toISOString().slice(0, 16));
    }
  }, [deliveryType]);

  const loadCarriers = async () => {
    try {
      setCarriersLoading(true);
      const response = await apiClient.getCarriers();
      setCarriers(response.carriers);
      // Default to BODA if available
      const boda = response.carriers.find(c => c.code === 'BODA');
      if (boda) {
        setSelectedCarrier('BODA');
      } else if (response.carriers.length > 0) {
        setSelectedCarrier(response.carriers[0].code);
      }
    } catch (error) {
      console.error('Failed to load carriers:', error);
      toast.error('Failed to load shipping carriers');
    } finally {
      setCarriersLoading(false);
    }
  };

  const handleGenerateTracking = async () => {
    try {
      setGenerating(true);
      const response = await apiClient.generateTrackingNumber(
        selectedCarrier,
        selectedCarrier === 'BODA' ? riderCode || undefined : undefined
      );
      setTrackingNumber(response.trackingNumber);
      setTrackingUrl(response.trackingUrl);
    } catch (error) {
      console.error('Failed to generate tracking:', error);
      toast.error('Failed to generate tracking number');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success('Tracking number copied');
  };

  const handleShip = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    if (selectedCarrier === 'BODA' && !riderCode.trim()) {
      toast.error('Please enter a rider code for Boda Boda delivery');
      return;
    }

    try {
      setLoading(true);
      await apiClient.handleWarehouseOrderAction(
        orderId,
        'ship',
        trackingNumber,
        selectedCarrier,
        selectedCarrier === 'BODA' ? riderCode : undefined,
        selectedCarrier === 'BODA' ? riderPhone : undefined,
        selectedCarrier === 'BODA' ? deliveryType : undefined,
        selectedCarrier === 'BODA' ? estimatedTime : undefined
      );
      toast.success('Order shipped successfully');
      onShipped();
      onClose();
      // Reset form
      setRiderCode('');
      setRiderPhone('');
      setTrackingNumber('');
      setTrackingUrl('');
    } catch (error) {
      console.error('Failed to ship order:', error);
      toast.error('Failed to ship order');
    } finally {
      setLoading(false);
    }
  };

  const selectedCarrierConfig = carriers.find(c => c.code === selectedCarrier);
  const isBodaBoda = selectedCarrier === 'BODA';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isBodaBoda ? 'bg-orange-100' : 'bg-purple-100'}`}>
              {isBodaBoda ? (
                <Bike className={`w-5 h-5 ${isBodaBoda ? 'text-orange-600' : 'text-purple-600'}`} />
              ) : (
                <Truck className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Ship Order</h3>
              <p className="text-sm text-slate-500">{orderNumber} • {storeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {carriersLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Loading carriers...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Carrier Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Shipping Carrier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {carriers.map((carrier) => (
                  <button
                    key={carrier.code}
                    onClick={() => setSelectedCarrier(carrier.code)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedCarrier === carrier.code
                        ? carrier.code === 'BODA'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-1.5 rounded ${
                      carrier.code === 'BODA' ? 'bg-orange-100' : 'bg-slate-100'
                    }`}>
                      {carrier.code === 'BODA' ? (
                        <Bike className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">{carrier.name}</p>
                      {carrier.sameDay && (
                        <span className="text-xs text-orange-600">Same day</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedCarrierConfig?.description && (
                <p className="text-xs text-slate-500 mt-1.5">
                  {selectedCarrierConfig.description}
                </p>
              )}
            </div>

            {/* Boda Boda Specific Fields */}
            {isBodaBoda && (
              <div className="bg-orange-50 rounded-xl p-4 space-y-4 border border-orange-100">
                <div className="flex items-center gap-2 text-orange-800">
                  <Bike className="w-4 h-4" />
                  <span className="font-medium text-sm">Boda Boda Delivery Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Rider Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., R123"
                      value={riderCode}
                      onChange={(e) => setRiderCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Rider Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+254..."
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Delivery Type
                  </label>
                  <div className="flex gap-2">
                    {['same_day', 'express', 'scheduled'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setDeliveryType(type)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          deliveryType === type
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-slate-600 border border-orange-200 hover:border-orange-300'
                        }`}
                      >
                        {type === 'same_day' ? 'Same Day' : type === 'express' ? 'Express' : 'Scheduled'}
                      </button>
                    ))}
                  </div>
                </div>

                {deliveryType === 'same_day' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Estimated Delivery Time
                    </label>
                    <input
                      type="datetime-local"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-100/50 rounded-lg p-2.5">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Rider will receive SMS with delivery details and tracking link.</p>
                </div>
              </div>
            )}

            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tracking Number
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={isBodaBoda ? "BODA-R123-78901" : "Enter tracking number"}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${
                      isBodaBoda
                        ? 'border-orange-300 focus:ring-orange-500'
                        : 'border-slate-300 focus:ring-purple-500'
                    }`}
                  />
                  {generating && (
                    <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                  )}
                </div>
                <button
                  onClick={handleGenerateTracking}
                  disabled={generating}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    isBodaBoda
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  } disabled:opacity-50`}
                  title="Auto-generate tracking number"
                >
                  <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  Auto
                </button>
                <button
                  onClick={handleCopyTracking}
                  disabled={!trackingNumber}
                  className="px-3 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  title="Copy tracking number"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {isBodaBoda
                  ? 'Format: BODA-{RIDER_CODE}-{SEQUENCE}'
                  : 'Enter the carrier tracking number or auto-generate'}
              </p>
            </div>

            {/* Tracking Preview */}
            {trackingUrl && (
              <div className={`rounded-lg p-3 border ${
                isBodaBoda ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className={`w-4 h-4 ${isBodaBoda ? 'text-orange-600' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${isBodaBoda ? 'text-orange-800' : 'text-blue-800'}`}>
                      {isBodaBoda ? 'Track Rider' : 'Tracking Link'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { navigator.clipboard.writeText(trackingUrl); toast.success('Tracking link copied for WhatsApp'); }}
                      className={`text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-white/50 ${
                        isBodaBoda ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'
                      }`}
                      title="Copy link for WhatsApp"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm flex items-center gap-1 ${
                        isBodaBoda ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Preview
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className={`text-xs truncate ${isBodaBoda ? 'text-orange-600' : 'text-blue-600'}`}>
                  {trackingUrl}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShip}
                disabled={loading || !trackingNumber.trim() || (isBodaBoda && !riderCode.trim())}
                className={`flex-1 py-2.5 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isBodaBoda
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Truck className="w-4 h-4" />
                )}
                {loading ? 'Shipping...' : 'Confirm & Ship'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
