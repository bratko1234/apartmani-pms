import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import * as movininTypes from ':movinin-types'

interface RevenueChartProps {
  data: movininTypes.RevenueTrendPoint[]
}

const SOURCE_COLORS: Record<string, string> = {
  direct: '#4CAF50',
  airbnb: '#FF5A5F',
  bookingCom: '#003580',
  expedia: '#FBAF00',
  other: '#9E9E9E',
}

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  airbnb: 'Airbnb',
  bookingCom: 'Booking.com',
  expedia: 'Expedia',
  other: 'Other',
}

const formatMonth = (value: string): string => {
  const [year, month] = value.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = parseInt(month, 10) - 1
  return `${monthNames[monthIndex]} ${year.slice(2)}`
}

const formatCurrency = (value: number): string =>
  `\u20AC${value.toLocaleString()}`

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload || !payload.length || !label) {
    return null
  }

  const total = payload.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="owner-chart-tooltip">
      <p className="owner-chart-tooltip-label">{formatMonth(label)}</p>
      {payload
        .filter((entry) => entry.value > 0)
        .map((entry) => (
          <p
            key={entry.dataKey}
            className="owner-chart-tooltip-item"
            style={{ color: entry.color }}
          >
            {SOURCE_LABELS[entry.dataKey] || entry.dataKey}: {formatCurrency(entry.value)}
          </p>
        ))}
      <p className="owner-chart-tooltip-total">
        Total: {formatCurrency(total)}
      </p>
    </div>
  )
}

const SOURCES = ['direct', 'airbnb', 'bookingCom', 'expedia', 'other'] as const

const RevenueChart = ({ data }: RevenueChartProps) => {
  if (!data.length) {
    return null
  }

  const activeSources = SOURCES.filter((source) =>
    data.some((point) => point[source] > 0),
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => SOURCE_LABELS[value] || value}
        />
        {activeSources.map((source) => (
          <Bar
            key={source}
            dataKey={source}
            stackId="revenue"
            fill={SOURCE_COLORS[source]}
            radius={source === activeSources[activeSources.length - 1] ? [3, 3, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueChart
