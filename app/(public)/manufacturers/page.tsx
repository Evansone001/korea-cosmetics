'use client'
import { useState } from 'react'
import PageTitle from "@/components/PageTitle"
import { Award, Globe, Users, CheckCircle, Star, MapPin, Mail, Phone, ExternalLink } from 'lucide-react'

export default function Manufacturers() {
    const [selectedRegion, setSelectedRegion] = useState('all')
    
    const regions = [
        { id: 'all', name: 'All Regions' },
        { id: 'seoul', name: 'Seoul' },
        { id: 'busan', name: 'Busan' },
        { id: 'incheon', name: 'Incheon' },
        { id: 'daegu', name: 'Daegu' }
    ]

    const manufacturers = [
        {
            id: 1,
            name: 'Seoul Beauty Labs',
            region: 'seoul',
            specialty: 'Skincare Innovation',
            founded: 2010,
            certifications: ['GMP Certified', 'ISO 9001', 'KFDA Approved'],
            products: 150,
            minOrder: 100,
            rating: 4.8,
            description: 'Leading innovator in Korean skincare with cutting-edge R&D facilities and patented formulations.',
            highlights: ['Patented snail mucin technology', 'Anti-aging expertise', 'Organic product lines'],
            contact: {
                email: 'partners@seoulbeautylabs.kr',
                phone: '+82-2-1234-5678',
                address: 'Gangnam-gu, Seoul, South Korea'
            }
        },
        {
            id: 2,
            name: 'Korea Cosmetics Co.',
            region: 'busan',
            specialty: 'Makeup & Color Cosmetics',
            founded: 2008,
            certifications: ['ISO 9001', 'Cruelty-Free', 'Vegan Certified'],
            products: 200,
            minOrder: 200,
            rating: 4.9,
            description: 'Premier manufacturer of color cosmetics and makeup products with global distribution network.',
            highlights: ['K-beauty makeup trends', 'Long-lasting formulations', 'Cruelty-free production'],
            contact: {
                email: 'wholesale@koreacosmetics.kr',
                phone: '+82-51-2345-6789',
                address: 'Haeundae-gu, Busan, South Korea'
            }
        },
        {
            id: 3,
            name: 'Busan Beauty Tech',
            region: 'busan',
            specialty: 'Hair Care Solutions',
            founded: 2012,
            certifications: ['KFDA Approved', 'Dermatologist Tested', 'Organic Certified'],
            products: 80,
            minOrder: 50,
            rating: 4.7,
            description: 'Specialized in advanced hair care formulations using traditional Korean ingredients and modern science.',
            highlights: ['Ginseng hair care', 'Scalp treatment expertise', 'Natural ingredient focus'],
            contact: {
                email: 'info@busanbeautytech.kr',
                phone: '+82-51-3456-7890',
                address: 'Saha-gu, Busan, South Korea'
            }
        },
        {
            id: 4,
            name: 'Incheon Skincare',
            region: 'incheon',
            specialty: 'Anti-Aging & Luxury',
            founded: 2015,
            certifications: ['GMP Certified', 'Luxury Standard', 'EU Compliant'],
            products: 60,
            minOrder: 150,
            rating: 4.9,
            description: 'Luxury skincare manufacturer focusing on premium anti-aging and high-end beauty products.',
            highlights: ['Premium ingredients', 'Anti-aging specialists', 'Luxury packaging'],
            contact: {
                email: 'luxury@incheonskincare.kr',
                phone: '+82-32-4567-8901',
                address: 'Yeonsu-gu, Incheon, South Korea'
            }
        },
        {
            id: 5,
            name: 'Daegu Beauty Labs',
            region: 'daegu',
            specialty: 'Natural & Organic Products',
            founded: 2016,
            certifications: ['Organic Certified', 'Vegan Certified', 'Eco-Friendly'],
            products: 120,
            minOrder: 75,
            rating: 4.6,
            description: 'Pioneering organic and natural beauty products with sustainable manufacturing practices.',
            highlights: ['100% organic ingredients', 'Sustainable packaging', 'Vegan formulations'],
            contact: {
                email: 'organic@daegubeautylabs.kr',
                phone: '+82-53-5678-9012',
                address: 'Jung-gu, Daegu, South Korea'
            }
        },
        {
            id: 6,
            name: 'Suwon Cosmetics',
            region: 'seoul',
            specialty: 'Medical Beauty & Dermaceutical',
            founded: 2009,
            certifications: ['Medical Grade', 'Dermatologist Tested', 'Clinical Proven'],
            products: 90,
            minOrder: 100,
            rating: 4.8,
            description: 'Medical-grade cosmetics manufacturer with dermatologist-developed formulations.',
            highlights: ['Medical-grade formulations', 'Dermatologist partnerships', 'Clinical testing'],
            contact: {
                email: 'medical@suwoncosmetics.kr',
                phone: '+82-31-6789-0123',
                address: 'Suwon, Gyeonggi-do, South Korea'
            }
        }
    ]

    const filteredManufacturers = manufacturers.filter(m => 
        selectedRegion === 'all' || m.region === selectedRegion
    )

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                <PageTitle 
                    heading="Korean Manufacturers" 
                    text="Partner with trusted Korean cosmetics manufacturers for authentic products" 
                    linkText="Back to Home" 
                    path="/" 
                />

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 md:p-12 mb-12">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🏭</div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            Trusted Korean Manufacturers
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                            We partner directly with leading Korean cosmetics manufacturers to bring you authentic, 
                            high-quality products. Each manufacturer is carefully vetted for quality, certification, 
                            and production capacity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                                Become a Partner
                            </button>
                            <button className="border border-pink-300 text-pink-700 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                Download Manufacturer List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-pink-600 mb-2">50+</div>
                        <div className="text-slate-600">Partner Manufacturers</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-pink-600 mb-2">1000+</div>
                        <div className="text-slate-600">Products Available</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-pink-600 mb-2">15+</div>
                        <div className="text-slate-600">Years Experience</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-pink-600 mb-2">100%</div>
                        <div className="text-slate-600">Authentic Products</div>
                    </div>
                </div>

                {/* Region Filter */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Filter by Region</h3>
                    <div className="flex flex-wrap gap-2">
                        {regions.map((region) => (
                            <button
                                key={region.id}
                                onClick={() => setSelectedRegion(region.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedRegion === region.id
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                {region.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Manufacturers Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {filteredManufacturers.map((manufacturer) => (
                        <div key={manufacturer.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{manufacturer.name}</h3>
                                    <p className="text-slate-600">{manufacturer.specialty}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="font-medium">{manufacturer.rating}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 mb-4">{manufacturer.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-sm text-slate-500">Founded</span>
                                    <p className="font-medium">{manufacturer.founded}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500">Products</span>
                                    <p className="font-medium">{manufacturer.products}+</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500">Min Order</span>
                                    <p className="font-medium">{manufacturer.minOrder} units</p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500">Region</span>
                                    <p className="font-medium capitalize">{manufacturer.region}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="text-sm text-slate-500 block mb-2">Certifications</span>
                                <div className="flex flex-wrap gap-2">
                                    {manufacturer.certifications.map((cert, index) => (
                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="text-sm text-slate-500 block mb-2">Key Highlights</span>
                                <ul className="space-y-1">
                                    {manufacturer.highlights.map((highlight, index) => (
                                        <li key={index} className="flex items-center text-sm text-slate-600">
                                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-slate-200 pt-4 space-y-2">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {manufacturer.contact.email}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {manufacturer.contact.phone}
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {manufacturer.contact.address}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                                    View Products
                                </button>
                                <button className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                                    Contact
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 text-white text-center mt-12">
                    <h2 className="text-2xl font-bold mb-4">Want to Partner With Us?</h2>
                    <p className="text-pink-50 mb-6 max-w-2xl mx-auto">
                        If you're a Korean cosmetics manufacturer looking to expand into the African market, 
                        we'd love to hear from you.
                    </p>
                    <button className="bg-white text-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                        Apply to Become a Partner
                    </button>
                </div>
            </div>
        </div>
    )
}
