import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ContentWindow } from './components/ContentWindow'
import styles from './App.module.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'basic' | 'advanced'>('basic')

  return (
    <div className={styles.app}>
      <Sidebar onPageChange={setCurrentPage} />
      <ContentWindow currentPage={currentPage} />
    </div>
  )
}

export default App
