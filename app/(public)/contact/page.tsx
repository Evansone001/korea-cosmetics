'use client'
import { useState } from 'react'
import PageTitle from "@/components/PageTitle"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Users, Building, Globe } from 'lucide-react'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general'
    })

    const handleInputChange = (e: { target: { name: any; value: any } }) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        // Handle form submission here
    }

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Head Office',
            details: ['123 Moi Avenue', 'Nairobi, Kenya 00100', 'East Africa'],
            color: 'text-pink-600'
        },
        {
            icon: Phone,
            title: 'Phone',
            details: ['+254 712 345 678', '+254 734 567 890', 'Mon-Fri 9AM-6PM EAT'],
            color: 'text-pink-600'
        },
        {
            icon: Mail,
            title: 'Email',
            details: ['info@koreabeautyhub.com', 'wholesale@KoreaCosmeticsHub.com', 'support@KoreaCosmeticsHub.com'],
            color: 'text-pink-600'
        },
        {
            icon: Clock,
            title: 'Business Hours',
            details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 2:00 PM', 'Sunday: Closed'],
            color: 'text-pink-600'
        }
    ]

    const inquiryTypes = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'wholesale', label: 'Wholesale Partnership' },
        { value: 'manufacturer', label: 'Manufacturer Partnership' },
        { value: 'support', label: 'Customer Support' },
        { value: 'complaint', label: 'Complaint' },
        { value: 'feedback', label: 'Feedback' }
    ]

    const offices = [
        {
            city: 'Nairobi',
            country: 'Kenya',
            address: '123 Moi Avenue, Nairobi Central',
            phone: '+254 712 345 678',
            email: 'nairobi@KoreaCosmeticsHub.com',
            type: 'Head Office'
        },
        {
            city: 'Mombasa',
            country: 'Kenya',
            address: '456 Digo Road, Mombasa Island',
            phone: '+254 723 456 789',
            email: 'mombasa@KoreaCosmeticsHub.com',
            type: 'Branch Office'
        },
        {
            city: 'Kampala',
            country: 'Uganda',
            address: '789 Kampala Road, Central Division',
            phone: '+256 712 345 678',
            email: 'kampala@KoreaCosmeticsHub.com',
            type: 'Regional Office'
        },
        {
            city: 'Dar es Salaam',
            country: 'Tanzania',
            address: '321 Morogoro Road, City Centre',
            phone: '+255 712 345 678',
            email: 'dar@KoreaCosmeticsHub.com',
            type: 'Regional Office'
        }
    ]

    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto py-8">
                <PageTitle 
                    heading="Contact Us" 
                    text="Get in touch with KoreaCosmetics' Hub for partnerships, inquiries, or support" 
                    linkText="Back to Home" 
                    path="/" 
                />

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 md:p-12 mb-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            Let's Connect and Grow Together
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                            Whether you're a retailer looking to stock Korean cosmetics, a manufacturer seeking 
                            distribution partners, or simply want to learn more about our B2B platform, we're here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium">
                                <MessageSquare className="w-5 h-5 inline mr-2" />
                                Live Chat
                            </button>
                            <button className="border border-pink-300 text-pink-700 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
                                <Phone className="w-5 h-5 inline mr-2" />
                                Call Us
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact Information Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className={`w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4`}>
                                <info.icon className={`w-6 h-6 ${info.color}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{info.title}</h3>
                            <div className="space-y-1">
                                {info.details.map((detail, idx) => (
                                    <p key={idx} className="text-sm text-slate-600">{detail}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Form and Offices */}
                <div className="grid lg:grid-cols-2 gap-12 mb-12">
                    {/* Contact Form */}
                    <div className="bg-white border border-slate-200 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Inquiry Type *
                                </label>
                                <select
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    {inquiryTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Message *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium inline-flex items-center justify-center"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Office Locations */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Office Locations</h2>
                        <div className="space-y-4">
                            {offices.map((office, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{office.city}</h3>
                                            <p className="text-sm text-slate-600">{office.country}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                                            {office.type}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-slate-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {office.address}
                                        </div>
                                        <div className="flex items-center text-slate-600">
                                            <Phone className="w-4 h-4 mr-2" />
                                            {office.phone}
                                        </div>
                                        <div className="flex items-center text-slate-600">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {office.email}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Contact Options */}
                <div className="bg-slate-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Other Ways to Reach Us</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-pink-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Partnership Team</h3>
                            <p className="text-sm text-slate-600 mb-3">For B2B and manufacturer partnerships</p>
                            <a href="mailto:partnerships@KoreaCosmeticsHub.com" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                partnerships@KoreaCosmeticsHub.com
                            </a>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building className="w-8 h-8 text-pink-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Sales Team</h3>
                            <p className="text-sm text-slate-600 mb-3">For wholesale orders and pricing</p>
                            <a href="mailto:sales@KoreaCosmeticsHub.com" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                sales@KoreaCosmeticsHub.com
                            </a>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-8 h-8 text-pink-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">International</h3>
                            <p className="text-sm text-slate-600 mb-3">For cross-border and global inquiries</p>
                            <a href="mailto:international@KoreaCosmeticsHub.com" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                                international@KoreaCosmeticsHub.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
