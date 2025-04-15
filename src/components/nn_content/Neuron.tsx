import { Matrix, matrix, multiply } from 'mathjs'
import { useState, useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import styles from './Neuron.module.css'
import { Node } from '../nn_building_blocks/Node'
import { Connection } from '../nn_building_blocks/Connection'

interface DataPoint {
  x1: number;
  x2: number;
  y_head: number;
  cluster: 'red' | 'blue';
}

export function Neuron() {
  const init_w1 = 3
  const init_w2 = 2.3
  const [hidden_weights, setHiddenWeights] = useState(() => matrix([[1, 1]]))
  const [hidden_bias, setHiddenBias] = useState(() => matrix([[5]]))
  const [output_weights, setOutputWeights] = useState(() => matrix([[1], [1]]))
  // Add state to track the vector start point
  const [vector_start, setVectorStart] = useState({ x: 0, y: 0 });
  const [vector_end, setVectorEnd] = useState({ x: init_w1, y: init_w2 });

  const [output_bias, setOutputBias] = useState(() => matrix([[1]]))
  const [weights, setWeights] = useState(() => matrix([[init_w1, init_w2]]))
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
      const sum = hidden_weights.get([0, 0])*x1 + hidden_weights.get([0, 1])* x2 + hidden_bias.get([0, 0]);
      
      // Assign cluster based on sum (using 10 as threshold)
      const cluster = sum < 0 ? 'red' : 'blue';
      
      data.push({ x1, x2, cluster, y_head: sum });
    }
    
    return data;
  }, []);

  // Update weights when vector endpoints change
  useEffect(() => {
    const w1 = vector_end.x - vector_start.x;
    const w2 = vector_end.y - vector_start.y;
    setWeights(matrix([[w1, w2]]));
  }, [vector_start, vector_end]);

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

    // Modify the end point drag behavior
    const dragBehavior = d3.drag<SVGCircleElement, unknown>()
      .on('drag', (event) => {
        const svgElement = d3.select(coordinateRef.current).node();
        const svgBounds = svgElement?.getBoundingClientRect();
        if (!svgBounds) return;

        // Calculate relative coordinates
        const relativeX = event.sourceEvent.clientX - svgBounds.left - margin.left;
        const relativeY = event.sourceEvent.clientY - svgBounds.top - margin.top;

        // Convert to data coordinates
        const newEndX = xScale.invert(relativeX);
        const newEndY = yScale.invert(relativeY);

        // Get current distance from origin to start point
        const startDistance = Math.sqrt(
          vector_start.x * vector_start.x + 
          vector_start.y * vector_start.y
        );

        // Calculate unit vector from origin to end point
        const totalLength = Math.sqrt(newEndX * newEndX + newEndY * newEndY);
        const unitVectorX = newEndX / totalLength;
        const unitVectorY = newEndY / totalLength;

        // Determine if start point should be on same or opposite side of origin
        const currentDotProduct = vector_start.x * vector_end.x + vector_start.y * vector_end.y;
        const sameDirection = currentDotProduct > 0;

        // Calculate new start point maintaining the same distance and relative direction from origin
        const directionMultiplier = sameDirection ? 1 : -1;
        const newStartX = directionMultiplier * unitVectorX * startDistance;
        const newStartY = directionMultiplier * unitVectorY * startDistance;

        // Update vector line and endpoints
        svg.select('.weight-vector')
          .attr('x1', xScale(newStartX))
          .attr('y1', yScale(newStartY))
          .attr('x2', xScale(newEndX))
          .attr('y2', yScale(newEndY));

        // Update start point
        svg.select('.vector-start-handle')
          .attr('cx', xScale(newStartX))
          .attr('cy', yScale(newStartY));

        // Update end point
        svg.select('.vector-end-handle')
          .attr('cx', xScale(newEndX))
          .attr('cy', yScale(newEndY));

        // Update label position
        svg.select('.vector-label')
          .attr('x', (xScale(newStartX) + xScale(newEndX)) / 2)
          .attr('y', (yScale(newStartY) + yScale(newEndY)) / 2 - 10)
          .text(`(${(newEndX - newStartX).toFixed(1)}, ${(newEndY - newStartY).toFixed(1)})`);

        // Update vector start and end states
        setVectorStart({ x: newStartX, y: newStartY });
        setVectorEnd({ x: newEndX, y: newEndY });
      });

    // Modify the start point drag behavior to maintain vector length
    const startPointDragBehavior = d3.drag<SVGCircleElement, unknown>()
      .on('drag', (event) => {
        const svgElement = d3.select(coordinateRef.current).node();
        const svgBounds = svgElement?.getBoundingClientRect();
        if (!svgBounds) return;

        // Get current vector values and calculate unit vector
        const w1 = vector_end.x - vector_start.x;
        const w2 = vector_end.y - vector_start.y;
        const vectorLength = Math.sqrt(w1 * w1 + w2 * w2);
        const unitW1 = w1 / vectorLength;
        const unitW2 = w2 / vectorLength;

        // Calculate relative coordinates
        const relativeX = event.sourceEvent.clientX - svgBounds.left - margin.left;
        const relativeY = event.sourceEvent.clientY - svgBounds.top - margin.top;
        
        // Convert to data coordinates
        const dragX = xScale.invert(relativeX) - vector_start.x;
        const dragY = yScale.invert(relativeY) - vector_start.y;

        // Project drag point onto vector direction
        const dot = dragX * unitW1 + dragY * unitW2;
        const projectedX = vector_start.x + dot * unitW1;
        const projectedY = vector_start.y + dot * unitW2;

        // Calculate movement delta
        const deltaX = projectedX - vector_start.x;
        const deltaY = projectedY - vector_start.y;

        // Calculate new end point with same delta
        const newEndX = vector_end.x + deltaX;
        const newEndY = vector_end.y + deltaY;

        // Update vector line and endpoints
        svg.select('.weight-vector')
          .attr('x1', xScale(projectedX))
          .attr('y1', yScale(projectedY))
          .attr('x2', xScale(newEndX))
          .attr('y2', yScale(newEndY));

        // Update start point
        svg.select('.vector-start-handle')
          .attr('cx', xScale(projectedX))
          .attr('cy', yScale(projectedY));

        // Update end point
        svg.select('.vector-end-handle')
          .attr('cx', xScale(newEndX))
          .attr('cy', yScale(newEndY));

        // Update label position
        svg.select('.vector-label')
          .attr('x', (xScale(projectedX) + xScale(newEndX)) / 2)
          .attr('y', (yScale(projectedY) + yScale(newEndY)) / 2 - 10)
          .text(`(${w1.toFixed(1)}, ${w2.toFixed(1)})`);

        // Update vector start and end states
        setVectorStart({ x: projectedX, y: projectedY });
        setVectorEnd({ x: newEndX, y: newEndY });
      });

    // Draw vector line
    svg.append('line')
      .attr('class', 'weight-vector')
      .attr('x1', xScale(vector_start.x))
      .attr('y1', yScale(vector_start.y))
      .attr('x2', xScale(vector_end.x))
      .attr('y2', yScale(vector_end.y))
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Add draggable endpoint
    svg.append('circle')
      .attr('class', 'vector-end-handle')
      .attr('cx', xScale(vector_end.x))
      .attr('cy', yScale(vector_end.y))
      .attr('r', 6)
      .attr('fill', '#ff7f0e')
      .attr('cursor', 'move')
      .call(dragBehavior as any);

    // Add draggable start point
    svg.append('circle')
      .attr('class', 'vector-start-handle')
      .attr('cx', xScale(vector_start.x))
      .attr('cy', yScale(vector_start.y))
      .attr('r', 6)
      .attr('fill', '#ff7f0e')
      .attr('cursor', 'move')
      .call(startPointDragBehavior as any);

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
      .attr('fill', '#333');

    // Update vector label
    svg.append('text')
      .attr('class', 'vector-label')
      .attr('x', (xScale(vector_start.x) + xScale(vector_end.x)) / 2)
      .attr('y', (yScale(vector_start.y) + yScale(vector_end.y)) / 2 - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('class', styles.vectorLabel)
      .text(`(${(vector_end.x - vector_start.x).toFixed(1)}, ${(vector_end.y - vector_start.y).toFixed(1)})`);

  }, [sampleData, selectedPoint, vector_start, vector_end]);

  return (
    <div className={styles.neuronContainer}>
      <div className={styles.demonstration}>
        <div className={styles.demoContent}>
          {/* Left side - Neuron visualization */}
          <div className={styles.neuronVisualization}>
            <div className={styles.visualTitle}>Neuron Structure</div>
            <div className={styles.visualContent}>
              <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
                {/* Center node */}
                <Node x={150} y={80} label="Σ" />
                
                {/* Input nodes - adjusted y position and spread */}
                <Node x={50} y={160} label="x₁" />
                <Node x={250} y={160} label="x₂" />
                
                {/* Connections with adjusted coordinates */}
                <Connection 
                  start={{x: 50, y: 160}} 
                  end={{x: 150, y: 80}} 
                  weight={weights.get([0, 0])}
                  nodeWidth={60}
                  nodeHeight={40}
                />
                <Connection 
                  start={{x: 250, y: 160}} 
                  end={{x: 150, y: 80}} 
                  weight={weights.get([0, 1])}
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