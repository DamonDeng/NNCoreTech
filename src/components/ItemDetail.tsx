import { Item } from '../types/Item'
import styles from './ItemDetail.module.css'
import { Neuron } from './nn_content/Neuron'
import { PlaceHolder } from './nn_content/PlaceHolder'

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

  const renderContent = () => {
    switch (item.contentComponent) {
      case 'Neuron':
        return <Neuron />
      case 'PlaceHolder':
        return <PlaceHolder content={item.content} />
      default:
        return <p>Unknown component type</p>
    }
  }

  return (
    <div className={styles.detailContainer}>
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  )
} 