import { Matrix, matrix, multiply } from 'mathjs'
import { useState, useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import styles from './Neuron.module.css'

interface DataPoint {
  x1: number;
  x2: number;
  cluster: 'red' | 'blue';
}

export function Neuron() {
  // Example weights and input - modified for 2 inputs
  const [weights] = useState(() => matrix([[0.5, -0.3]]))  // Two weights
  const [input] = useState(() => matrix([[1], [2]]))       // Two inputs (x1, x2)
  const weightedSum = multiply(weights, input)
  
  const coordinateRef = useRef<SVGSVGElement>(null)

  // Generate sample data
  const sampleData = useMemo(() => {
    const data: DataPoint[] = [];
    
    // Generate 100 random points
    for (let i = 0; i < 100; i++) {
      const x1 = 1 + Math.random() * 8; // Random value between 1 and 9
      const x2 = 1 + Math.random() * 8; // Random value between 1 and 9
      const sum = x1 + x2;
      
      // Assign cluster based on sum (using 10 as threshold)
      const cluster = sum < 10 ? 'red' : 'blue';
      
      data.push({ x1, x2, cluster });
    }
    
    return data;
  }, []);

  useEffect(() => {
    if (!coordinateRef.current) return

    // Clear previous content
    d3.select(coordinateRef.current).selectAll("*").remove()

    // Setup
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 400 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(coordinateRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-2, 10])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([-2, 10])
      .range([height, 0])

    // Add axes at (0,0)
    svg.append('g')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale))
      .attr('class', styles.axis)

    svg.append('g')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale))
      .attr('class', styles.axis)

    // Add grid lines
    svg.append('g')
      .attr('class', styles.grid)
      .selectAll('line')
      .data(xScale.ticks())
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .style('opacity', d => d === 0 ? 0 : 0.1)

    svg.append('g')
      .attr('class', styles.grid)
      .selectAll('line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .style('opacity', d => d === 0 ? 0 : 0.1)

    // Add data points
    svg.selectAll('circle')
      .data(sampleData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x1))
      .attr('cy', d => yScale(d.x2))
      .attr('r', 4)
      .attr('fill', d => d.cluster)
      .attr('opacity', 0.6)

    // Add labels
    svg.append('text')
      .attr('x', width - 20)
      .attr('y', yScale(0) + 25)
      .text('x₁')
      .attr('class', styles.axisLabel)

    svg.append('text')
      .attr('x', xScale(0) - 25)
      .attr('y', 20)
      .text('x₂')
      .attr('class', styles.axisLabel)

    // Add separation line x1 + x2 = 10
    const linePoints = [
      { x: 0, y: 10 },
      { x: 10, y: 0 }
    ];

    svg.append('line')
      .attr('x1', xScale(linePoints[0].x))
      .attr('y1', yScale(linePoints[0].y))
      .attr('x2', xScale(linePoints[1].x))
      .attr('y2', yScale(linePoints[1].y))
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.5);

  }, [sampleData]);

  return (
    <div className={styles.neuronContainer}>
      <div className={styles.demonstration}>
        <div className={styles.demoContent}>
          {/* Left side - Neuron visualization */}
          <div className={styles.neuronVisualization}>
            <div className={styles.visualTitle}>Neuron Structure</div>
            <div className={styles.visualContent}>
              <div>x₁, x₂ → Neuron visualization</div>
            </div>
          </div>

          {/* Updated right side with coordinate system */}
          <div className={styles.coordinateSystem}>
            <div className={styles.visualTitle}>Input Space (x₁, x₂)</div>
            <div className={styles.visualContent}>
              <svg ref={coordinateRef}></svg>
            </div>
          </div>
        </div>

        {/* Matrix display at the bottom */}
        <div className={styles.matrixDisplay}>
          <div className={styles.matrix}>
            <h4>Inputs (x₁, x₂)</h4>
            <pre>{input.toString()}</pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weights (w₁, w₂)</h4>
            <pre>{weights.toString()}</pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weighted Sum</h4>
            <pre>{weightedSum.toString()}</pre>
          </div>
        </div>
      </div>
      
      <div className={styles.explanation}>
        <h4>How it Works</h4>
        <p>An artificial neuron is the basic unit of neural networks. It processes information in the following steps:</p>
        <ol>
          <li>Receives two inputs x₁ and x₂</li>
          <li>Multiplies each input by its corresponding weight (w₁, w₂)</li>
          <li>Sums up the weighted inputs (w₁x₁ + w₂x₂)</li>
          <li>Applies an activation function to the sum</li>
        </ol>
      </div>
    </div>
  )
} 