import React from 'react'
import styles from './index.module.scss'

interface BackProps {
  children: React.ReactNode
}

const Back = ({ children }: BackProps) => {
  return (
    <div className={styles.background}>
      {children}
    </div >
  )
}

export default Back