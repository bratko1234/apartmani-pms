import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import * as movininTypes from ':movinin-types'

interface OccupancyChartProps {
  data: movininTypes.OccupancyTrendPoint[]
}

const formatMonth = (value: string): string => {
  const [year, month] = value.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = parseInt(month, 10) - 1
  return `${monthNames[monthIndex]} ${year.slice(2)}`
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload || !payload.length || !label) {
    return null
  }

  return (
    <div className="owner-chart-tooltip">
      <p className="owner-chart-tooltip-label">{formatMonth(label)}</p>
      <p className="owner-chart-tooltip-value">
        {`${payload[0].value}%`}
      </p>
    </div>
  )
}

const OccupancyChart = ({ data }: OccupancyChartProps) => {
  if (!data.length) {
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1976d2" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value: number) => `${value}%`}
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="occupancyRate"
          stroke="#1976d2"
          strokeWidth={2}
          fill="url(#occupancyGradient)"
          dot={{ r: 4, fill: '#1976d2', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#1976d2', strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default OccupancyChart
