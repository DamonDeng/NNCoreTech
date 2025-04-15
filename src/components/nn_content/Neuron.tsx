import { Matrix, matrix, multiply } from 'mathjs'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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

interface VectorPoints {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

function calculateVectorPoints(w1: number, w2: number, bias: number): VectorPoints {
  const w_norm = Math.sqrt(w1 * w1 + w2 * w2);

  if (w_norm === 0) {
    return {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 }
    };
  }

  const bias_length = - bias / w_norm;
  const unit_w1 = w1 / w_norm;
  const unit_w2 = w2 / w_norm;

  return {
    start: {
      x: bias_length * unit_w1,
      y: bias_length * unit_w2
    },
    end: {
      x: (bias_length + w_norm) * unit_w1,
      y: (bias_length + w_norm) * unit_w2
    }
  };
}

// Move sample data generation outside component
function generateSampleData(count: number, real_w1: number, real_w2: number, real_bias: number): DataPoint[] {
  const data: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const x1 = 1 + Math.random() * 8;
    const x2 = 1 + Math.random() * 8;
    const sum = real_w1 * x1 + real_w2 * x2 + real_bias; // Using default weights and bias
    const cluster = sum < 0 ? 'red' : 'blue';
    data.push({ x1, x2, cluster, y_head: sum });
  }
  return data;
}

const real_w1 = 1;
const real_w2 = 1;
const real_bias = -10;

const SAMPLE_DATA = generateSampleData(100, real_w1, real_w2, real_bias);

export function Neuron() {
  // Initialize states
  const init_w1 = 3;
  const init_w2 = 2.3;
  const init_bias = 0;
  
  const [sampleData] = useState(SAMPLE_DATA);
  const [weights, setWeights] = useState(() => matrix([[init_w1, init_w2]]));
  const [bias, setBias] = useState(init_bias);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(() => SAMPLE_DATA[0]);
  const [input, setInput] = useState(() => matrix([[SAMPLE_DATA[0].x1], [SAMPLE_DATA[0].x2]]));

  // Memoize heavy calculations
  const weightedSum = useMemo(() => 
    multiply(weights, input),
    [weights, input]
  );

  const vectorPoints = useMemo(() => {
    const w1 = weights.get([0, 0]);
    const w2 = weights.get([0, 1]);
    return calculateVectorPoints(w1, w2, bias);
  }, [weights, bias]);

  // Memoize handlers
  const handleW1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newW1 = parseFloat(e.target.value);
    const currentW2 = weights.get([0, 1]);
    setWeights(matrix([[newW1, currentW2]]));
  }, [weights]);

  const handleW2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const currentW1 = weights.get([0, 0]);
    const newW2 = parseFloat(e.target.value);
    setWeights(matrix([[currentW1, newW2]]));
  }, [weights]);

  const handleBiasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBias(parseFloat(e.target.value));
  }, []);

  const coordinateRef = useRef<SVGSVGElement>(null);

  // Define dimensions outside effects so they can be shared
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = 400 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Initial setup effect
  useEffect(() => {
    if (!coordinateRef.current) return;

    // Clear previous content
    d3.select(coordinateRef.current).selectAll("*").remove();

    // Create SVG and scales
    const svg = d3.select(coordinateRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([-2, 10])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-2, 10])
      .range([height, 0]);

    // Add static elements (axes, grid, etc.)
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

    // Add data points group
    svg.append('g')
      .attr('class', 'data-points');

    // Add vector elements
    svg.append('line')
      .attr('class', 'weight-vector');

    svg.append('text')
      .attr('class', 'vector-label');

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

    // Add perpendicular line element
    svg.append('line')
      .attr('class', 'perpendicular-line')
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

  }, []); // Empty dependency array for one-time setup

  // Update effect
  useEffect(() => {
    if (!coordinateRef.current) return;

    const svg = d3.select(coordinateRef.current);
    const xScale = d3.scaleLinear().domain([-2, 10]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-2, 10]).range([height, 0]);

    // Update data points
    const points = svg.select('.data-points')
      .selectAll('circle')
      .data(sampleData);

    points.enter()
      .append('circle')
      .merge(points as any)
      .attr('cx', d => xScale(d.x1))
      .attr('cy', d => yScale(d.x2))
      .attr('r', d => selectedPoint && d === selectedPoint ? 6 : 4)
      .attr('fill', d => {
        if (selectedPoint && d === selectedPoint) {
          return '#006400';
        }
        return d.cluster;
      })
      .attr('opacity', d => selectedPoint && d === selectedPoint ? 1 : 0.6)
      .attr('stroke', d => selectedPoint && d === selectedPoint ? '#333' : 'none')
      .attr('stroke-width', 2)
      .attr('class', styles.dataPoint)
      .style('cursor', 'pointer')
      .on('click', (event, d) => setSelectedPoint(d));

    points.exit().remove();

    // Update vector
    svg.select('.weight-vector')
      .attr('x1', xScale(vectorPoints.start.x))
      .attr('y1', yScale(vectorPoints.start.y))
      .attr('x2', xScale(vectorPoints.end.x))
      .attr('y2', yScale(vectorPoints.end.y))
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Update vector label
    svg.select('.vector-label')
      .attr('x', (xScale(vectorPoints.start.x) + xScale(vectorPoints.end.x)) / 2)
      .attr('y', (yScale(vectorPoints.start.y) + yScale(vectorPoints.end.y)) / 2 - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('class', styles.vectorLabel)
      .text(`(${(vectorPoints.end.x - vectorPoints.start.x).toFixed(1)}, ${(vectorPoints.end.y - vectorPoints.start.y).toFixed(1)})`);

    // Calculate perpendicular line endpoints
    const vectorDx = vectorPoints.end.x - vectorPoints.start.x;
    const vectorDy = vectorPoints.end.y - vectorPoints.start.y;
    
    // Calculate perpendicular direction (rotate 90 degrees)
    const perpLength = 4; // Half of total length (8/2)
    const perpDx = -vectorDy / Math.sqrt(vectorDx * vectorDx + vectorDy * vectorDy);
    const perpDy = vectorDx / Math.sqrt(vectorDx * vectorDx + vectorDy * vectorDy);

    const perpStart = {
      x: vectorPoints.start.x - perpDx * perpLength,
      y: vectorPoints.start.y - perpDy * perpLength
    };

    const perpEnd = {
      x: vectorPoints.start.x + perpDx * perpLength,
      y: vectorPoints.start.y + perpDy * perpLength
    };

    // Update perpendicular line
    svg.select('.perpendicular-line')
      .attr('x1', xScale(perpStart.x))
      .attr('y1', yScale(perpStart.y))
      .attr('x2', xScale(perpEnd.x))
      .attr('y2', yScale(perpEnd.y));

  }, [sampleData, selectedPoint, vectorPoints]);

  return (
    <div className={styles.neuronContainer}>
      <div className={styles.demonstration}>
        <div className={styles.demoContent}>
          {/* Left side - Neuron visualization */}
          <div className={styles.neuronVisualization}>
            <div className={styles.visualTitle}>Neuron Structure</div>
            <div className={styles.visualContent}>
              <div className={styles.neuronStructure}>
                <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
                  {/* Center node */}
                  <Node x={150} y={80} label="Σ" />
                  
                  {/* Input nodes and bias */}
                  <Node x={50} y={160} label="1" />  
                  <Node x={150} y={160} label="x₁" />
                  
                  <Node x={250} y={160} label="x₂" />
                  
                  {/* Weight labels */}
                  <text x={85} y={120} className={styles.weightLabel}>b: {bias.toFixed(2)}</text>
                  <text x={150} y={120} className={styles.weightLabel}>w₁: {weights.get([0, 0]).toFixed(2)}</text>
                  <text x={215} y={120} className={styles.weightLabel}>w₂: {weights.get([0, 1]).toFixed(2)}</text>
                  
                  {/* Bias connection */}
                  <Connection 
                    start={{x: 50, y: 160}} 
                    end={{x: 150, y: 80}} 
                    weight={bias}
                    nodeWidth={60}
                    nodeHeight={40}
                    showWeight={false}
                  />

                  {/* Regular connections */}
                  <Connection 
                    start={{x: 150, y: 160}} 
                    end={{x: 150, y: 80}} 
                    weight={weights.get([0, 0])}
                    nodeWidth={60}
                    nodeHeight={40}
                    showWeight={false}
                  />
                  
                  
                  
                  {/* Second weight connection */}
                  <Connection 
                    start={{x: 250, y: 160}} 
                    end={{x: 150, y: 80}} 
                    weight={weights.get([0, 1])}
                    nodeWidth={60}
                    nodeHeight={40}
                    showWeight={false}
                  />
                </svg>
              </div>
              
              {/* Slider controls */}
              
              <div className={styles.weightControls}>
              <div className={styles.weightSlider}>
                  <label>bias</label>
                  <input 
                    type="range" 
                    min="-10" 
                    max="10" 
                    step="0.1"
                    value={bias}
                    onChange={handleBiasChange}
                  />
                  <span>{bias.toFixed(2)}</span>
                </div>
                <div className={styles.weightSlider}>
                  <label>w₁</label>
                  <input 
                    type="range" 
                    min="-5" 
                    max="5" 
                    step="0.1"
                    value={vectorPoints.end.x - vectorPoints.start.x}
                    onChange={handleW1Change}
                  />
                  <span>{(vectorPoints.end.x - vectorPoints.start.x).toFixed(2)}</span>
                </div>
                <div className={styles.weightSlider}>
                  <label>w₂</label>
                  <input 
                    type="range" 
                    min="-5" 
                    max="5" 
                    step="0.1"
                    value={vectorPoints.end.y - vectorPoints.start.y}
                    onChange={handleW2Change}
                  />
                  <span>{(vectorPoints.end.y - vectorPoints.start.y).toFixed(2)}</span>
                </div>
                
              </div>
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

        {/* Updated matrix display with Loss and Y */}
        <div className={styles.matrixDisplay}>
          <div className={styles.matrix}>
            <h4>Input & Bias</h4>
            <pre>
              {selectedPoint 
                ? `x₁: ${selectedPoint.x1.toFixed(2)}\nx₂: ${selectedPoint.x2.toFixed(2)}\nb: 1.00`
                : 'Click a point'}
            </pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weights & Bias</h4>
            <pre>
              {`w₁: ${weights.get([0, 0]).toFixed(2)}\nw₂: ${weights.get([0, 1]).toFixed(2)}\nb: ${bias.toFixed(2)}`}
            </pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weighted Sum</h4>
            <pre>
              {selectedPoint 
                ? `${selectedPoint.x1.toFixed(2)} × ${weights.get([0, 0]).toFixed(2)} +\n${selectedPoint.x2.toFixed(2)} × ${weights.get([0, 1]).toFixed(2)} +\n1.00 × ${bias.toFixed(2)}`
                : '-'}
            </pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Result</h4>
            <pre>
              {selectedPoint 
                ? (selectedPoint.x1 * weights.get([0, 0]) + 
                   selectedPoint.x2 * weights.get([0, 1]) + 
                   bias).toFixed(2)
                : '-'}
            </pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Y</h4>
            <pre>
              {selectedPoint 
                ? (selectedPoint.x1 * real_w1 + 
                   selectedPoint.x2 * real_w2 + 
                   real_bias).toFixed(2)
                : '-'}
            </pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Loss</h4>
            <pre>
              {selectedPoint 
                ? Math.abs(
                    (selectedPoint.x1 * weights.get([0, 0]) + 
                     selectedPoint.x2 * weights.get([0, 1]) + 
                     bias) -
                    (selectedPoint.x1 * real_w1 + 
                     selectedPoint.x2 * real_w2 + 
                     real_bias)
                  ).toFixed(2)
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