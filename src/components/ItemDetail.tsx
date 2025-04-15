import { Item } from '../types/Item'
import styles from './ItemDetail.module.css'

interface ItemDetailProps {
  item: Item | null
}

export function ItemDetail({ item }: ItemDetailProps) {
  if (!item) {
    return (
      <div className={styles.detailContainer}>
        <p className={styles.placeholder}>Please select an item from the list</p>
      </div>
    )
  }

  return (
    <div className={styles.detailContainer}>
      <h2>{item.title}</h2>
      <div className={styles.content}>
        {item.content}
      </div>
    </div>
  )
} 