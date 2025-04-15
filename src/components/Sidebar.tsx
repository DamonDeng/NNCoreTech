import { AiOutlineAppstore, AiOutlineSetting } from 'react-icons/ai'
import { useState } from 'react'
import styles from './Sidebar.module.css'

interface SidebarProps {
  onPageChange: (page: 'basic' | 'advanced') => void
}

export function Sidebar({ onPageChange }: SidebarProps) {
  const [selected, setSelected] = useState<'basic' | 'advanced'>('basic')

  const handleClick = (page: 'basic' | 'advanced') => {
    setSelected(page)
    onPageChange(page)
  }

  return (
    <div className={styles.sidebar}>
      <div
        className={`${styles.iconWrapper} ${selected === 'basic' ? styles.selected : ''}`}
        onClick={() => handleClick('basic')}
      >
        {AiOutlineAppstore({ size: 24 })}
      </div>
      <div
        className={`${styles.iconWrapper} ${selected === 'advanced' ? styles.selected : ''}`}
        onClick={() => handleClick('advanced')}
      >
        {AiOutlineSetting({ size: 24 })}
      </div>
    </div>
  )
} 