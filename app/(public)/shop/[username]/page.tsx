'use client'

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Package, ShieldCheck, Users } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { Store, Product } from "@/types";

export default function StorePage() {
  const params = useParams();
  const username = params.username as string;
  const [store, setStore] = useState<Store | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await (apiClient as any).request(`/api/stores/public/${username}`) as any;
        if (!resp?.store) { setNotFound404(true); return; }
        setStore(resp.store);
        setStoreProducts(resp.products ?? []);
      } catch {
        setNotFound404(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Loading store...</p></div>;
  }

  if (notFound404 || !store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Store Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Store Logo */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-pink-100 bg-white shadow-md">
              <Image
                src={store.logo || "/default-store.png"}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
                {store.status === "approved" && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    <ShieldCheck size={12} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-slate-600 mb-3 max-w-2xl">{store.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-pink-500" />
                  {store.address}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  4.8 rating
                </span>
                <span className="flex items-center gap-1">
                  <Package size={14} className="text-pink-500" />
                  {storeProducts.length} products
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} className="text-pink-500" />
                  2,340+ customers
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all">
                Follow Store
              </button>
              <button className="border-2 border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-medium hover:border-pink-300 hover:text-pink-600 transition-all">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Stats Bar */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-pink-600">{storeProducts.length}</p>
              <p className="text-sm text-slate-600">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">98%</p>
              <p className="text-sm text-slate-600">Positive Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">4.8</p>
              <p className="text-sm text-slate-600">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">2-4 days</p>
              <p className="text-sm text-slate-600">Shipping Time</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Products by {store.name}
            <span className="text-sm font-normal text-slate-500 ml-2">({storeProducts.length} items)</span>
          </h2>
          <Link 
            href="/shop" 
            className="text-pink-600 hover:text-pink-700 font-medium text-sm"
          >
            Browse All Products →
          </Link>
        </div>
        
        {storeProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {storeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-pink-500" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Products Yet</h3>
            <p className="text-slate-600 mb-4">
              This store hasn&apos;t listed any products yet. Check back soon!
            </p>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
