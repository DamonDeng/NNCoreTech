import { CSSProperties } from 'react'
import styles from './Node.module.css'

interface NodeProps {
  x: number
  y: number
  width?: number
  height?: number
  label?: string
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export function Node({
  x,
  y,
  width = 60,
  height = 40,
  label,
  className = '',
  style = {},
  onClick
}: NodeProps) {
  return (
    <g
      transform={`translate(${x - width/2},${y - height/2})`}
      className={`${styles.node} ${className}`}
      onClick={onClick}
    >
      <rect
        width={width}
        height={height}
        rx={8}
        className={styles.nodeShape}
        style={style}
      />
      {label && (
        <text
          x={width/2}
          y={height/2}
          className={styles.nodeLabel}
        >
          {label}
        </text>
      )}
    </g>
  )
} 