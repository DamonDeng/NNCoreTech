import { Matrix, matrix, multiply } from 'mathjs'
import { useState, useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import styles from './Neuron.module.css'
import { Node } from '../nn_building_blocks/Node'
import { Connection } from '../nn_building_blocks/Connection'

interface DataPoint {
  x1: number;
  x2: number;
  cluster: 'red' | 'blue';
}

export function Neuron() {
  const [weights, setWeights] = useState(() => matrix([[3, 2.3]]))
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)
  const [input, setInput] = useState(() => matrix([[1], [2]]))

  // Update input when a point is selected
  useEffect(() => {
    if (selectedPoint) {
      setInput(matrix([[selectedPoint.x1], [selectedPoint.x2]]))
    }
  }, [selectedPoint])

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

    // Updated data points with selection
    svg.selectAll('circle')
      .data(sampleData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x1))
      .attr('cy', d => yScale(d.x2))
      .attr('r', 4)
      .attr('fill', d => d.cluster)
      .attr('opacity', d => 
        selectedPoint && d === selectedPoint ? 1 : 0.6
      )
      .attr('stroke', d => 
        selectedPoint && d === selectedPoint ? '#333' : 'none'
      )
      .attr('stroke-width', 2)
      .attr('class', styles.dataPoint)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedPoint(d)
      })

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

    // Add weight vector with draggable endpoint
    const w1 = weights.get([0, 0])
    const w2 = weights.get([0, 1])
    const vectorScale = 1

    // Create drag behavior with proper typing
    const dragBehavior = d3.drag<SVGCircleElement, unknown>()
      .on('drag', (event) => {
        // Get coordinates relative to the SVG container
        const svgElement = d3.select(coordinateRef.current).node();
        const svgBounds = svgElement?.getBoundingClientRect();
        if (!svgBounds) return;

        // Calculate relative coordinates
        const relativeX = event.sourceEvent.clientX - svgBounds.left - margin.left;
        const relativeY = event.sourceEvent.clientY - svgBounds.top - margin.top;

        // Convert to data coordinates
        const newW1 = xScale.invert(relativeX);
        const newW2 = yScale.invert(relativeY);

        // Constrain to coordinate bounds
        const boundedW1 = Math.max(-2, Math.min(10, newW1));
        const boundedW2 = Math.max(-2, Math.min(10, newW2));
        
        // Update weights matrix
        setWeights(matrix([[boundedW1, boundedW2]]));
        
        // Update vector position using scaled coordinates
        d3.select<SVGCircleElement, unknown>(event.sourceEvent.target)
          .attr('cx', xScale(boundedW1))
          .attr('cy', yScale(boundedW2));
        
        // Update vector line
        svg.select<SVGLineElement>('.weight-vector')
          .attr('x2', xScale(boundedW1))
          .attr('y2', yScale(boundedW2));
        
        // Update label position
        svg.select<SVGTextElement>('.vector-label')
          .attr('x', (xScale(0) + xScale(boundedW1)) / 2)
          .attr('y', (yScale(0) + yScale(boundedW2)) / 2 - 10)
          .text(`(${boundedW1.toFixed(1)}, ${boundedW2.toFixed(1)})`);
      });

    // Draw vector line
    svg.append('line')
      .attr('class', 'weight-vector')
      .attr('x1', xScale(0))
      .attr('y1', yScale(0))
      .attr('x2', xScale(w1 * vectorScale))
      .attr('y2', yScale(w2 * vectorScale))
      .attr('stroke', '#ff7f0e')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Add draggable endpoint with proper typing
    svg.append('circle')
      .attr('class', styles.vectorHandle)
      .attr('cx', xScale(w1 * vectorScale))
      .attr('cy', yScale(w2 * vectorScale))
      .attr('r', 6)
      .attr('fill', '#ff7f0e')
      .attr('cursor', 'move')
      .call(dragBehavior as any); // Type assertion as temporary fix

    // Add arrowhead definition
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ff7f0e');

    // Update vector label
    svg.append('text')
      .attr('class', 'vector-label')
      .attr('x', xScale(w1 * vectorScale * 0.5))
      .attr('y', yScale(w2 * vectorScale * 0.5) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ff7f0e')
      .attr('class', styles.vectorLabel)
      .text(`(${w1.toFixed(1)}, ${w2.toFixed(1)})`);

  }, [sampleData, selectedPoint, weights]);

  return (
    <div className={styles.neuronContainer}>
      <div className={styles.demonstration}>
        <div className={styles.demoContent}>
          {/* Left side - Neuron visualization */}
          <div className={styles.neuronVisualization}>
            <div className={styles.visualTitle}>Neuron Structure</div>
            <div className={styles.visualContent}>
              <svg width="300" height="200">
                <Node x={150} y={50} label="Σ" />
                
                <Node x={75} y={150} label="x₁" />
                <Node x={225} y={150} label="x₂" />
                
                <Connection 
                  start={{x: 75, y: 150}} 
                  end={{x: 150, y: 50}} 
                  weight={0.5}
                  nodeWidth={60}
                  nodeHeight={40}
                />
                <Connection 
                  start={{x: 225, y: 150}} 
                  end={{x: 150, y: 50}} 
                  weight={-0.3}
                  nodeWidth={60}
                  nodeHeight={40}
                />
              </svg>
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

        {/* Updated matrix display with selected point info */}
        <div className={styles.matrixDisplay}>
          <div className={styles.matrix}>
            <h4>Selected Point</h4>
            <pre>
              {selectedPoint 
                ? `x₁: ${selectedPoint.x1.toFixed(2)}\nx₂: ${selectedPoint.x2.toFixed(2)}`
                : 'Click a point'}
            </pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weights (w₁, w₂)</h4>
            <pre>{weights.toString()}</pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weighted Sum (y head)</h4>
            <pre>{weightedSum.toString()}</pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Sum (Y)</h4>
            <pre>
              {selectedPoint 
                ? (selectedPoint.x1 + selectedPoint.x2).toFixed(2)
                : '-'}
            </pre>
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