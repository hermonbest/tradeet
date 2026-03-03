'use client'

interface TradeScoreChartProps {
  score: number
  size?: number
  className?: string
}

export function TradeScoreChart({ score, size = 96, className = '' }: TradeScoreChartProps) {
  // Spider web chart with pentagon shape
  // The score polygon adjusts based on the score value (0-10)
  const normalizedScore = Math.max(0, Math.min(10, score))
  const scale = normalizedScore / 10

  // Pentagon points - center is 50,50, radius varies
  // Top: 50,10 -> scaled to center based on score
  // Top-right: 90,40
  // Bottom-right: 75,90
  // Bottom-left: 25,90
  // Top-left: 10,40

  const centerX = 50
  const centerY = 50
  const maxRadius = 40

  const getPoint = (angle: number, radius: number) => {
    const rad = (angle - 90) * (Math.PI / 180)
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad)
    }
  }

  // Pentagon angles (top, top-right, bottom-right, bottom-left, top-left)
  const angles = [0, 72, 144, 216, 288]
  
  // Calculate polygon points based on score
  const polygonPoints = angles.map(angle => {
    const point = getPoint(angle, maxRadius * scale)
    return `${point.x},${point.y}`
  }).join(' ')

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background spider web */}
        <g className="stroke-zinc-700 fill-none">
          {/* Outer pentagon */}
          <polygon points="50,10 90,40 75,90 25,90 10,40" strokeWidth="1" />
          
          {/* Middle pentagon */}
          <polygon points="50,30 75,50 65,75 35,75 25,50" strokeWidth="0.5" />
          
          {/* Center lines */}
          <line x1="50" y1="50" x2="50" y2="10" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="90" y2="40" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="75" y2="90" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="25" y2="90" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="10" y2="40" strokeWidth="0.5" />
        </g>
        
        {/* Score polygon (filled) */}
        <polygon 
          points={polygonPoints}
          fill="rgba(124, 58, 237, 0.4)"
          stroke="#7C3AED"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Score label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-[#7C3AED]">{score.toFixed(1)}</span>
      </div>
    </div>
  )
}
