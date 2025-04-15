import { CSSProperties } from 'react'
import styles from './Connection.module.css'

interface Point {
  x: number
  y: number
}

interface ConnectionProps {
  start: Point
  end: Point
  weight: number
  nodeWidth: number
  nodeHeight: number
  showWeight?: boolean
}

export function Connection({
  start,
  end,
  weight,
  nodeWidth,
  nodeHeight,
  showWeight = true
}: ConnectionProps) {
  // Calculate actual connection points at node edges
  const startPoint = {
    x: start.x,
    y: start.y - nodeHeight/2  // Connect to top edge of start node
  }
  
  const endPoint = {
    x: end.x,
    y: end.y + nodeHeight/2    // Connect to bottom edge of end node
  }

  // Calculate control points for a smoother upward curve
  const controlPoint1 = {
    x: startPoint.x,
    y: startPoint.y - (startPoint.y - endPoint.y) * 0.5
  }
  
  const controlPoint2 = {
    x: endPoint.x,
    y: endPoint.y + (startPoint.y - endPoint.y) * 0.5
  }

  const path = `
    M ${startPoint.x} ${startPoint.y}
    C ${controlPoint1.x} ${controlPoint1.y},
      ${controlPoint2.x} ${controlPoint2.y},
      ${endPoint.x} ${endPoint.y}
  `

  // Update weight label position
  const labelX = (startPoint.x + endPoint.x) / 2
  const labelY = (startPoint.y + endPoint.y) / 2 + (startPoint.x < endPoint.x ? 10 : -10)

  return (
    <g className={`${styles.connection}`}>
      <path
        d={path}
        className={styles.connectionPath}
      />
      {showWeight && (
        <text
          x={labelX}
          y={labelY}
          className={styles.weightLabel}
        >
          {weight.toFixed(2)}
        </text>
      )}
    </g>
  )
} 