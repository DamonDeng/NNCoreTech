import { Matrix, matrix, multiply } from 'mathjs'
import { useState } from 'react'
import styles from './Neuron.module.css'

export function Neuron() {
  // Example weights and input
  const [weights] = useState(() => matrix([[0.5, 0.3, -0.1]]))
  const [input] = useState(() => matrix([[1], [2], [3]]))

  // Calculate weighted sum
  const weightedSum = multiply(weights, input)

  return (
    <div className={styles.neuronContainer}>
      <div className={styles.demonstration}>
        <h3>Interactive Neuron Demonstration</h3>
        <div className={styles.matrixDisplay}>
          <div className={styles.matrix}>
            <h4>Input Values</h4>
            <pre>{input.toString()}</pre>
          </div>
          <div className={styles.operationArrow}>→</div>
          <div className={styles.matrix}>
            <h4>Weights</h4>
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
          <li>Receives multiple inputs (shown in the first matrix)</li>
          <li>Multiplies each input by its corresponding weight (shown in the second matrix)</li>
          <li>Sums up all weighted inputs to produce the output (shown in the last matrix)</li>
          <li>Applies an activation function (not shown in this basic example)</li>
        </ol>
      </div>
    </div>
  )
} 