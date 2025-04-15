import { useState } from 'react'
import { Item } from '../types/Item'
import { ItemList } from './ItemList'
import { ItemDetail } from './ItemDetail'
import styles from './Basic.module.css'

// Test data
const testItems: Item[] = [
  {
    id: '1',
    title: 'First Item',
    content: 'This is the detailed content for the first item. It can contain a lot of information about the item.'
  },
  {
    id: '2',
    title: 'Second Item',
    content: 'Here is the content for the second item. You can put any kind of information here.'
  },
  {
    id: '3',
    title: 'Third Item',
    content: 'The third item contains different content. This is just a placeholder text for testing.'
  },
  {
    id: '4',
    title: 'Fourth Item',
    content: 'Content for the fourth item goes here. This is another example of placeholder content.'
  }
]

export function Basic() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  return (
    <div className={styles.container}>
      <ItemList
        items={testItems}
        onSelectItem={setSelectedItem}
        selectedId={selectedItem?.id || null}
      />
      <ItemDetail item={selectedItem} />
    </div>
  )
} 