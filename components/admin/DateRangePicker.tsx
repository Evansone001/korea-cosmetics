'use client'
import { useState } from 'react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import { Calendar, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'

interface DateRangePickerProps {
    onRangeChange: (days: number) => void
    onGranularityChange: (granularity: 'daily' | 'monthly' | 'yearly') => void
    currentRange: string
    currentGranularity: 'daily' | 'monthly' | 'yearly'
}

const presets = [
    { label: 'Last 24h', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last 1 year', days: 365 },
    { label: 'Last 2 years', days: 730 },
]

export default function DateRangePicker({ onRangeChange, onGranularityChange, currentRange, currentGranularity }: DateRangePickerProps) {
    const [open, setOpen] = useState(false)

    const getCurrentLabel = () => {
        const preset = presets.find(p => p.days === parseInt(currentRange) || 
            (currentRange === '24h' && p.days === 1) ||
            (currentRange === '7d' && p.days === 7) ||
            (currentRange === '30d' && p.days === 30) ||
            (currentRange === '90d' && p.days === 90) ||
            (currentRange === '6m' && p.days === 180) ||
            (currentRange === '1y' && p.days === 365) ||
            (currentRange === '2y' && p.days === 730))
        return preset?.label || 'Custom'
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Time Range */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1 border border-slate-300 rounded text-xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">{getCurrentLabel()}</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </PopoverTrigger>
                <PopoverContent 
                    className="bg-white rounded-lg shadow-lg border border-slate-200 p-2 w-40 z-50"
                    align="start"
                >
                    <div className="space-y-1">
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    onRangeChange(preset.days)
                                    setOpen(false)
                                }}
                                className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Granularity */}
            <select 
                value={currentGranularity} 
                onChange={(e) => onGranularityChange(e.target.value as 'daily' | 'monthly' | 'yearly')}
                className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
            </select>
        </div>
    )
}
