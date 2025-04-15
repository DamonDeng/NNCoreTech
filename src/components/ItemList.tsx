import { Item } from '../types/Item'
import styles from './ItemList.module.css'

interface ItemListProps {
  items: Item[]
  onSelectItem: (item: Item) => void
  selectedId: string | null
}

export function ItemList({ items, onSelectItem, selectedId }: ItemListProps) {
  return (
    <div className={styles.listContainer}>
      <h3>Items</h3>
      <div className={styles.list}>
        {items.map(item => (
          <div
            key={item.id}
            className={`${styles.listItem} ${item.id === selectedId ? styles.selected : ''}`}
            onClick={() => onSelectItem(item)}
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  )
} 