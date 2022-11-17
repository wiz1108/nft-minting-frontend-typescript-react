import styles from './index.module.scss'

interface ButtonProps {
  text: string;
  onClick: Function;
}


const MyButton = (props: ButtonProps) => {
  return (
    <div className={styles.button} onClick={() => props.onClick()}><div>{props.text}</div></div>
  )
}

export default MyButton