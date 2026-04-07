'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import type { Product } from "@/types";

export default function Product() {

    const { productId } = useParams();
    const searchParams = useSearchParams();
    const type = (searchParams.get('type') as 'retail' | 'b2b') || 'retail'; // Default to retail
    
    const [product, setProduct] = useState<Product | undefined>();
    const products = useAppSelector(state => state.product.list);

    const fetchProduct = async () => {
        const foundProduct = products.find((product) => product.id === productId);
        setProduct(foundProduct);
    }

    useEffect(() => {
        if (products.length > 0) {
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [productId, products]);

    return (
        <div className="mx-6">
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
