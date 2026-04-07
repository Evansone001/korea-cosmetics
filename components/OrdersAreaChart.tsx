'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface OrderData {
    createdAt: string;
    total: number;
}

interface OrdersAreaChartProps {
    allOrders: OrderData[];
}

export default function OrdersAreaChart({ allOrders }: OrdersAreaChartProps) {

    // Group orders by date
    const ordersPerDay = allOrders.reduce((acc: Record<string, number>, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0] // format: YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1
        return acc
    }, {})

    // Convert to array for Recharts
    const chartData = Object.entries(ordersPerDay).map(([date, count]) => ({
        date,
        orders: count
    }))

    return (
        <div className="w-full max-w-4xl h-[300px] text-xs">
            <h3 className="text-lg font-medium text-slate-800 mb-4 pt-2 text-right"> <span className='text-slate-500'>Orders /</span> Day</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                        formatter={(value: number) => [`${value} orders`, 'Orders']}
                        labelFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                        }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="#3b82f6" 
                        fill="#93c5fd" 
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
