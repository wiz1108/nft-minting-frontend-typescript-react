import WalletConnectButton from "../../Web3/WalletConnectButton"

import styles from './index.module.scss'

const Header = () => {
  return (
    <div className={styles.box}>
      <WalletConnectButton />
    </div>
  )
}

export default Header
