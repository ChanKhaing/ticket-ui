import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface RevenueChartProps {
  data: { day: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Revenue per day for the last 7 days</p>
        </div>
        {hoveredIndex !== null && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-sm text-indigo-700 font-medium animate-in fade-in duration-150">
            {data[hoveredIndex].day}: {formatCurrency(data[hoveredIndex].revenue)}
          </div>
        )}
      </div>

      <div className="relative h-64 w-full pt-4">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-gray-400 w-full" />
          <div className="border-b border-gray-400 w-full" />
          <div className="border-b border-gray-400 w-full" />
          <div className="border-b border-gray-400 w-full" />
        </div>

        {/* Bars */}
        <div className="relative h-full flex items-end justify-between gap-2 sm:gap-6 px-2">
          {data.map((item, index) => {
            const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 4)
            const isHovered = hoveredIndex === index

            return (
              <div
                key={item.day}
                className="flex flex-1 flex-col items-center h-full justify-end cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="w-full max-w-[48px] flex items-end justify-center h-[calc(100%-24px)]">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      isHovered
                        ? 'bg-indigo-600 shadow-md shadow-indigo-200 scale-105'
                        : 'bg-indigo-500/80 hover:bg-indigo-600'
                    }`}
                  />
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors ${
                    isHovered ? 'text-indigo-600 font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
