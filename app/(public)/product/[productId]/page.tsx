'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/types";

export default function Product() {

    const { productId } = useParams();
    const searchParams = useSearchParams();
    const type = (searchParams.get('type') as 'retail' | 'b2b') || 'retail'; // Default to retail

    const [product, setProduct] = useState<Product | undefined>();
    const [loading, setLoading] = useState(true);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            // Fetch product from backend API
            const response = await apiClient.getProduct(productId as string) as { product: {
                id: string;
                name: string;
                description: string;
                price?: number;
                b2c_retail_price?: number;
                mrp?: number;
                category: string;
                brand: string;
                images?: string[];
                stock_quantity?: number;
                in_stock?: boolean;
                created_at?: string;
                updated_at?: string;
            } | null };
            if (response?.product) {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
                const images = (response.product.images || []).map((img: string) => {
                    // If image is a relative path, prepend backend URL
                    if (img.startsWith('/uploads/')) {
                        return `${backendUrl}${img}`;
                    }
                    return img;
                });

                const backendProduct: Product = {
                    id: response.product.id,
                    name: response.product.name,
                    description: response.product.description,
                    price: response.product.b2c_retail_price || response.product.price || 0,
                    mrp: response.product.mrp || response.product.b2c_retail_price || response.product.price || 0,
                    category: response.product.category,
                    brand: response.product.brand,
                    images: images,
                    inStock: response.product.in_stock ?? true,
                    rating: [],
                    storeId: '',
                    createdAt: response.product.created_at || new Date().toISOString(),
                    updatedAt: response.product.updated_at || new Date().toISOString(),
                };
                setProduct(backendProduct);
            } else {
                setProduct(undefined);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            setProduct(undefined);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProduct();
        scrollTo(0, 0)
    }, [productId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category} / {type === 'b2b' ? 'B2B Wholesale' : 'Retail'}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} type={type} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}
