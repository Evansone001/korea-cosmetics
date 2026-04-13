'use client'
import { useState } from 'react'
import PageTitle from "@/components/PageTitle"
import { Package, Users, Truck, Shield, TrendingUp, Award, CheckCircle, ArrowRight } from 'lucide-react'

export default function Wholesale() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    
    const categories = [
        { id: 'all', name: 'All Products', icon: '🧴' },
        { id: 'skincare', name: 'Skincare', icon: '🧴' },
        { id: 'makeup', name: 'Makeup', icon: '💄' },
        { id: 'haircare', name: 'Hair Care', icon: '👱‍♀️' },
        { id: 'bodycare', name: 'Body Care', icon: '🛁' }
    ]

    const wholesaleTiers = [
        {
            name: 'Bronze Partner',
            minOrder: 50,
            discount: '15%',
            benefits: ['Free shipping', 'Basic support', 'Standard packaging'],
            recommended: false
        },
        {
            name: 'Silver Partner',
            minOrder: 200,
            discount: '25%',
            benefits: ['Free shipping', 'Priority support', 'Custom branding', 'Marketing materials'],
            recommended: true
        },
        {
            name: 'Gold Partner',
            minOrder: 500,
            discount: '35%',
            benefits: ['Free shipping', 'Dedicated support', 'Exclusive products', 'Custom formulations', 'Co-branding opportunities'],
            recommended: false
        }
    ]

    const featuredProducts = [
        {
            name: 'Snail Mucin Essence Set',
            retailPrice: 65.99,
            wholesalePrice: 25.99,
            minOrder: 10,
            category: 'skincare',
            image: '🧴'
        },
        {
            name: 'Vitamin C Serum Bundle',
            retailPrice: 79.99,
            wholesalePrice: 30.99,
            minOrder: 10,
            category: 'skincare',
            image: '💧'
        },
        {
            name: 'K-Beauty Makeup Collection',
            retailPrice: 89.99,
            wholesalePrice: 35.99,
            minOrder: 15,
            category: 'makeup',
            image: '💄'
        },
        {
            name: 'Hair Care Treatment Set',
            retailPrice: 54.99,
            wholesalePrice: 22.99,
            minOrder: 12,
            category: 'haircare',
            image: '👱‍♀️'
        }
    ]

    const benefits = [
        { icon: Package, title: 'Bulk Pricing', description: 'Get up to 35% off retail prices with wholesale orders' },
        { icon: Truck, title: 'Free Shipping', description: 'Complimentary shipping on orders over 50 units' },
        { icon: Shield, title: 'Quality Guarantee', description: 'All products are authentic and quality-assured' },
        { icon: Users, title: 'Dedicated Support', description: 'Personal account manager for all wholesale partners' },
        { icon: TrendingUp, title: 'Growing Market', description: 'Tap into the booming Korean beauty market in Africa' },
        { icon: Award, title: 'Exclusive Access', description: 'Get early access to new products and limited editions' }
    ]

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                <PageTitle 
                    heading="B2B Wholesale" 
                    text="Partner with us for premium Korean cosmetics at wholesale prices" 
                    linkText="Back to Products" 
                    path="/shop" 
                />

                {/* Hero Section */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 md:p-12 text-white mb-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">
                                Wholesale Korean Cosmetics
                            </h1>
                            <p className="text-xl mb-6 text-pink-50">
                                Join our B2B program and get access to premium Korean beauty products at exclusive wholesale prices. Perfect for retailers, salons, and distributors.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-white text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                    Become a Partner
                                </button>
                                <button className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-pink-600 transition-colors font-medium">
                                    Download Catalog
                                </button>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-8xl mb-4">🇰🇷</div>
                            <div className="text-2xl font-bold">Based in Kenya</div>
                            <div className="text-pink-100">Serving the African Market</div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Partner With Us?</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                                    <benefit.icon className="w-6 h-6 text-pink-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                                <p className="text-slate-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wholesale Tiers */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Wholesale Partnership Tiers</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {wholesaleTiers.map((tier, index) => (
                            <div key={index} className={`bg-white border-2 rounded-xl p-6 relative ${tier.recommended ? 'border-pink-500 shadow-lg' : 'border-slate-200'}`}>
                                {tier.recommended && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-pink-600">{tier.discount}</span>
                                    <span className="text-slate-600"> off</span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm text-slate-600">Minimum Order:</span>
                                    <span className="text-lg font-semibold text-slate-900 ml-2">{tier.minOrder} units</span>
                                </div>
                                <ul className="space-y-2 mb-6">
                                    {tier.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-slate-600">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-2 rounded-lg font-medium transition-colors ${tier.recommended ? 'bg-pink-500 text-white hover:bg-pink-600' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                                    Choose Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Wholesale Products */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Featured Wholesale Products</h2>
                    
                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedCategory === category.id
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts
                            .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
                            .map((product, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="text-4xl text-center mb-4">{product.image}</div>
                                    <h3 className="font-semibold text-slate-900 mb-2">{product.name}</h3>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Retail Price:</span>
                                            <span className="font-medium">${product.retailPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Wholesale:</span>
                                            <span className="font-bold text-pink-600">${product.wholesalePrice}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Min Order:</span>
                                            <span className="font-medium">{product.minOrder} pcs</span>
                                        </div>
                                    </div>
                                    <button className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                                        Order Wholesale
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-slate-50 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Start Your Wholesale Journey?</h2>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                        Join hundreds of retailers and distributors across Africa who trust KoreaCosmetics' Hub for authentic Korean cosmetics.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium inline-flex items-center justify-center">
                            Apply for Wholesale Account
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                        <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                            Contact Sales Team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
