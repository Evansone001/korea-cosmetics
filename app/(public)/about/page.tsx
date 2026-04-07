'use client'
import { useState } from 'react'
import PageTitle from "@/components/PageTitle"
import { MapPin, Globe, Users, Award, Package, Target, Heart, CheckCircle, ArrowRight } from 'lucide-react'

export default function About() {
    const stats = [
        { number: '50+', label: 'Korean Brands' },
        { number: '1000+', label: 'Products' },
        { number: '15+', label: 'Years Experience' },
        { number: '35+', label: 'African Countries' }
    ]

    const values = [
        {
            icon: Heart,
            title: 'Authenticity',
            description: 'We guarantee 100% authentic Korean cosmetics directly from manufacturers'
        },
        {
            icon: Users,
            title: 'Partnership',
            description: 'Building long-term relationships with retailers and distributors across Africa'
        },
        {
            icon: Package,
            title: 'Quality',
            description: 'Rigorous quality control and certification standards for all products'
        },
        {
            icon: Target,
            title: 'Growth',
            description: 'Empowering African businesses with access to premium Korean beauty products'
        }
    ]

    const milestones = [
        { year: '2009', event: 'Founded in Nairobi, Kenya' },
        { year: '2012', event: 'First Korean manufacturer partnership' },
        { year: '2015', event: 'Expanded to 10 African countries' },
        { year: '2018', event: 'Launched B2B wholesale program' },
        { year: '2021', event: 'Partnered with 50+ Korean brands' },
        { year: '2026', event: 'Serving 35+ African countries' }
    ]

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                <PageTitle 
                    heading="About KoreaBeauty Hub" 
                    text="Your trusted gateway to authentic Korean cosmetics in Africa" 
                    linkText="Back to Home" 
                    path="/" 
                />

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 md:p-12 mb-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">
                                Bridging Korean Beauty with Africa
                            </h1>
                            <p className="text-lg text-slate-600 mb-6">
                                KoreaBeauty Hub is East Africa's premier Korean cosmetics B2B platform, 
                                connecting African retailers and distributors with authentic Korean beauty products. 
                                Founded in 2009 and based in Nairobi, Kenya, we've become the trusted partner 
                                for businesses seeking access to the booming K-beauty market.
                            </p>
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 text-pink-600" />
                                    <span className="font-medium">Nairobi, Kenya</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Globe className="w-5 h-5 text-pink-600" />
                                    <span className="font-medium">35+ Countries</span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                                    Our Story
                                </button>
                                <button className="border border-pink-300 text-pink-700 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                    Meet the Team
                                </button>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-8xl mb-4">🌍</div>
                            <div className="text-2xl font-bold text-slate-900">Connecting Continents</div>
                            <div className="text-pink-600">Through Beauty</div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-pink-600 mb-2">{stat.number}</div>
                            <div className="text-slate-600">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Mission & Vision */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white border border-slate-200 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                        <p className="text-slate-600 mb-4">
                            To democratize access to premium Korean cosmetics across Africa by building 
                            a trusted B2B platform that connects manufacturers directly with retailers and distributors.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center text-slate-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Authentic products guaranteed
                            </li>
                            <li className="flex items-center text-slate-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Competitive wholesale pricing
                            </li>
                            <li className="flex items-center text-slate-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Reliable logistics and support
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
                        <p className="text-slate-600 mb-4">
                            To become Africa's leading Korean cosmetics B2B platform, empowering thousands 
                            of retailers and distributors to thrive in the beauty industry while bringing 
                            the best of K-beauty to every corner of the continent.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-center text-slate-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Pan-African presence
                            </li>
                            <li className="flex items-center text-slate-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                100+ Korean brand partnerships
                            </li>
                            <li className="flex items-center text-slate-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Technology-driven solutions
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Core Values */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                                    <value.icon className="w-6 h-6 text-pink-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-slate-600 text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Journey</h2>
                    <div className="relative">
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-pink-200"></div>
                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className="w-1/2"></div>
                                    <div className="w-8 h-8 bg-pink-500 rounded-full border-4 border-white z-10"></div>
                                    <div className="w-1/2 px-8">
                                        <div className="bg-white border border-slate-200 rounded-xl p-6">
                                            <div className="text-pink-600 font-bold mb-1">{milestone.year}</div>
                                            <div className="text-slate-900 font-medium">{milestone.event}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Why Choose KoreaBeauty Hub?</h2>
                    <p className="text-pink-50 mb-6 max-w-2xl mx-auto">
                        We're not just a platform - we're your strategic partner in the Korean beauty business. 
                        Our expertise, relationships, and commitment to your success set us apart.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <Award className="w-12 h-12 mx-auto mb-3" />
                            <h3 className="font-bold mb-2">15+ Years Experience</h3>
                            <p className="text-pink-100 text-sm">Deep industry knowledge and expertise</p>
                        </div>
                        <div>
                            <Users className="w-12 h-12 mx-auto mb-3" />
                            <h3 className="font-bold mb-2">500+ Partners</h3>
                            <p className="text-pink-100 text-sm">Growing network of successful retailers</p>
                        </div>
                        <div>
                            <Package className="w-12 h-12 mx-auto mb-3" />
                            <h3 className="font-bold mb-2">Quality Assured</h3>
                            <p className="text-pink-100 text-sm">100% authentic Korean cosmetics</p>
                        </div>
                    </div>
                    <button className="bg-white text-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium inline-flex items-center">
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    )
}
