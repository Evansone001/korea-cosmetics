import PageTitle from "@/components/PageTitle";

export default function CancellationPolicy() {
    return (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-4xl mx-auto py-8">
                <PageTitle 
                    heading="Cancellation & Refund Policy" 
                    text="Understand how to cancel orders and our refund process" 
                    linkText="Back to Orders" 
                    path="/orders" 
                />

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
                    {/* Overview */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Cancellation</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We understand that sometimes you may need to cancel an order. We offer a flexible cancellation 
                            policy to ensure your shopping experience is hassle-free. Orders can be cancelled at any time 
                            before they are shipped from our warehouse.
                        </p>
                    </section>

                    {/* When Can You Cancel */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">When Can You Cancel?</h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 text-sm">✓</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Pending Orders</p>
                                    <p className="text-sm text-slate-600">Orders that haven't been processed yet can be cancelled immediately.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 text-sm">✓</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Processing Orders</p>
                                    <p className="text-sm text-slate-600">Orders being prepared can be cancelled before they are shipped.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-600 text-sm">✕</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Shipped Orders</p>
                                    <p className="text-sm text-slate-600">Once an order has been shipped, it cannot be cancelled. You may return it after delivery.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-red-600 text-sm">✕</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Delivered Orders</p>
                                    <p className="text-sm text-slate-600">Delivered orders cannot be cancelled. Please use our return process instead.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to Cancel */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">How to Cancel an Order</h2>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600">
                            <li>Log in to your account and go to the <strong>My Orders</strong> page</li>
                            <li>Find the order you wish to cancel</li>
                            <li>Click on the <strong>Cancel Order</strong> button (available for eligible orders)</li>
                            <li>Select a reason for cancellation from the dropdown menu</li>
                            <li>Review the cancellation details and confirm</li>
                            <li>You will receive a confirmation email once the cancellation is processed</li>
                        </ol>
                    </section>

                    {/* Refund Policy */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Refund Policy</h2>
                        
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                            <h3 className="font-medium text-blue-800 mb-2">Refund Timeline</h3>
                            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                <li>Refunds are processed within 5-7 business days after cancellation</li>
                                <li>The refund will be credited to your original payment method</li>
                                <li>You will receive an email notification once the refund is initiated</li>
                            </ul>
                        </div>

                        <h3 className="font-medium text-slate-800 mb-2">Refund Methods</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-slate-700">Payment Method</th>
                                    <th className="px-4 py-2 font-medium text-slate-700">Refund Method</th>
                                    <th className="px-4 py-2 font-medium text-slate-700">Processing Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                <tr>
                                    <td className="px-4 py-3">M-Pesa</td>
                                    <td className="px-4 py-3">M-Pesa (same number)</td>
                                    <td className="px-4 py-3">1-2 business days</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3">Credit/Debit Card</td>
                                    <td className="px-4 py-3">Original card</td>
                                    <td className="px-4 py-3">5-10 business days</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3">Bank Transfer</td>
                                    <td className="px-4 py-3">Original bank account</td>
                                    <td className="px-4 py-3">3-5 business days</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3">Cash on Delivery</td>
                                    <td className="px-4 py-3">M-Pesa or bank transfer</td>
                                    <td className="px-4 py-3">3-5 business days</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    {/* Partial Cancellations */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Partial Cancellations</h2>
                        <p className="text-slate-600 leading-relaxed mb-3">
                            Currently, we do not support partial order cancellations. If you wish to remove specific items 
                            from your order, you will need to:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600">
                            <li>Cancel the entire order (if still eligible)</li>
                            <li>Place a new order with only the items you want</li>
                        </ol>
                        <p className="text-slate-600 mt-3">
                            We are working on adding partial cancellation functionality in the future.
                        </p>
                    </section>

                    {/* Exceptions */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Exceptions & Special Cases</h2>
                        <div className="space-y-3">
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h3 className="font-medium text-yellow-800 mb-1">Promotional Orders</h3>
                                <p className="text-sm text-yellow-700">
                                    Orders with promotional discounts or special offers may have different cancellation terms. 
                                    Please check the specific promotion terms at checkout.
                                </p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h3 className="font-medium text-yellow-800 mb-1">Bulk/B2B Orders</h3>
                                <p className="text-sm text-yellow-700">
                                    Wholesale and bulk orders may require additional processing time for cancellations. 
                                    Please contact our customer service for assistance.
                                </p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                <h3 className="font-medium text-yellow-800 mb-1">Pre-order Items</h3>
                                <p className="text-sm text-yellow-700">
                                    Pre-order items can be cancelled until they are dispatched from our warehouse or 
                                    the manufacturer. Once dispatched, standard cancellation rules apply.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Need Help?</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            If you have any questions about cancelling an order or our refund policy, 
                            our customer service team is here to help.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a 
                                href="mailto:support@KoreaCosmetics'.co.ke" 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                support@KoreaCosmetics'.co.ke
                            </a>
                            <a 
                                href="tel:+254712345678" 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +254 712 345 678
                            </a>
                        </div>
                    </section>

                    {/* Last Updated */}
                    <div className="border-t border-slate-200 pt-6 text-sm text-slate-500">
                        Last updated: January 2026
                    </div>
                </div>
            </div>
        </div>
    )
}
