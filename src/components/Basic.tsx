import { useState } from 'react'
import { Item, ContentComponentType } from '../types/Item'
import { ItemList } from './ItemList'
import { ItemDetail } from './ItemDetail'
import styles from './Basic.module.css'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

// Test data
const testItems: Item[] = [
  {
    id: '1',
    title: 'Neuron',
    content: 'Explanation of artificial neuron.',
    contentComponent: 'Neuron'
  },
  {
    id: '2',
    title: 'Second Item',
    content: 'Here is the content for the second item. You can put any kind of information here.',
    contentComponent: 'PlaceHolder'
  },
  {
    id: '3',
    title: 'Third Item',
    content: 'The third item contains different content. This is just a placeholder text for testing.',
    contentComponent: 'PlaceHolder'
  },
  {
    id: '4',
    title: 'Fourth Item',
    content: 'Content for the fourth item goes here. This is another example of placeholder content.',
    contentComponent: 'PlaceHolder'
  }
]

export function Basic() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  return (
    <div className={styles.container}>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <ItemList
            items={testItems}
            onSelectItem={setSelectedItem}
            selectedId={selectedItem?.id || null}
          />
        </Panel>
        <PanelResizeHandle className={styles.resizeHandle}>
          <div className={styles.resizeBar} />
        </PanelResizeHandle>
        <Panel>
          <ItemDetail item={selectedItem} />
        </Panel>
      </PanelGroup>
    </div>
  )
} 