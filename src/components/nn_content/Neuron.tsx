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
      <h3>Artificial Neuron</h3>
      
      <div className={styles.explanation}>
        <p>An artificial neuron is the basic unit of neural networks. It:</p>
        <ol>
          <li>Receives multiple inputs</li>
          <li>Multiplies each input by a weight</li>
          <li>Sums up all weighted inputs</li>
          <li>Applies an activation function</li>
        </ol>
      </div>

      <div className={styles.demonstration}>
        <h4>Interactive Demonstration</h4>
        <div className={styles.matrixDisplay}>
          <div className={styles.matrix}>
            <h5>Weights</h5>
            <pre>{weights.toString()}</pre>
          </div>
          <div className={styles.matrix}>
            <h5>Input</h5>
            <pre>{input.toString()}</pre>
          </div>
          <div className={styles.matrix}>
            <h5>Output</h5>
            <pre>{weightedSum.toString()}</pre>
          </div>
        </div>
      </div>
    </div>
  )
} 