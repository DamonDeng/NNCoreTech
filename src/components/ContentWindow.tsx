import { Basic } from './Basic'
import { Advanced } from './Advanced'
import styles from './ContentWindow.module.css'

interface ContentWindowProps {
  currentPage: 'basic' | 'advanced'
}

export function ContentWindow({ currentPage }: ContentWindowProps) {
  return (
    <div className={styles.contentWindow}>
      {currentPage === 'basic' ? <Basic /> : <Advanced />}
    </div>
  )
} 