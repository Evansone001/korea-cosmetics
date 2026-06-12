'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700',  icon: <Clock size={14} /> },
  approved:   { label: 'Approved',   color: 'bg-blue-100 text-blue-700',    icon: <CheckCircle2 size={14} /> },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: <RefreshCw size={14} /> },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700', icon: <Truck size={14} /> },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 size={14} /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',      icon: <XCircle size={14} /> },
};

export default function WholesaleOrdersPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response: any = await apiClient.getMyWholesalePurchases();
      setPurchases(response?.purchases || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load wholesale orders');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? purchases : purchases.filter(p => p.status === filter);

  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/store/wholesale" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Purchases</h1>
          <p className="text-slate-500 text-sm">Track your warehouse purchase orders</p>
        </div>
        <button
          onClick={fetchPurchases}
          className="ml-auto p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['all', 'pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'All Orders' : STATUS_CONFIG[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-600 font-medium mb-1">No orders found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {filter === 'all' ? "You haven't placed any warehouse purchases yet." : `No ${filter} orders.`}
          </p>
          <Link
            href="/store/wholesale"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Package size={16} /> Browse Wholesale Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((purchase: any) => {
            const status = (purchase.status || 'pending').toLowerCase();
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
            const isExpanded = expandedId === purchase.id;

            return (
              <div key={purchase.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Order header */}
                <button
                  onClick={() => toggleExpand(purchase.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-900 text-sm">
                        {purchase.order_number || purchase.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {formatDate(purchase.created_at)} &middot; {purchase.items?.length ?? 0} item(s)
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-slate-900">KShs {Number(purchase.total_amount).toLocaleString()}</div>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400 ml-auto mt-1" /> : <ChevronDown size={16} className="text-slate-400 ml-auto mt-1" />}
                  </div>
                </button>

                {/* Expanded items */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    {/* Status-specific messages */}
                    {status === 'pending' && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                        ⏳ Your order is awaiting admin review. You'll be notified once it's approved.
                      </div>
                    )}
                    {status === 'approved' && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                        ✅ Order approved and is being prepared for shipment.
                      </div>
                    )}
                    {status === 'shipped' && purchase.tracking_number && (
                      <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700">
                        🚚 Tracking: <strong>{purchase.tracking_number}</strong>
                      </div>
                    )}
                    {status === 'cancelled' && purchase.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                        ❌ Reason: {purchase.rejection_reason}
                      </div>
                    )}
                    {purchase.admin_comments && (
                      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                        💬 Admin note: {purchase.admin_comments}
                      </div>
                    )}

                    {/* Items table */}
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Items</p>
                      {(purchase.items || []).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{item.product_name || 'Product'}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity} &times; KShs {Number(item.unit_price).toLocaleString()}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            KShs {Number(item.total_price ?? item.quantity * item.unit_price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                      <span className="text-slate-500">Total (incl. tax)</span>
                      <span className="font-bold text-slate-900">KShs {Number(purchase.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
