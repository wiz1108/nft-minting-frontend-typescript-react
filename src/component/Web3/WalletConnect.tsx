import { useEffect, useRef } from 'react'
import { useDetectOutsideClick } from '../../utils/hooks'

import * as walletMetamask from "../../helpers/wallet-metamask"
import * as walletConnect from "../../helpers/wallet-connect"
import * as walletDefiwallet from "../../helpers/wallet-defiwallet"

import styles from './index.module.scss'

interface WalletConnectProps {
  open: boolean;
  setOpen: Function;
  setWallet: Function;
}

export default function KeepMountedModal(props: WalletConnectProps) {
  const modalRef = useRef(null)
  const [isActive, setIsActive] = useDetectOutsideClick(modalRef, props.open)
  const handleClose = () => props.setOpen(false)
  let wallet = null

  useEffect(() => {
    setIsActive(props.open)
  }, [props.open])

  const onConnect = async (connector: string) => {
    props.setOpen(false)
    switch (connector) {
      case 'metamask':
        wallet = await walletMetamask.connect()
        break
      case 'walletconnect':
        wallet = await walletConnect.connect()
        break
      case 'defiwallet':
        wallet = await walletDefiwallet.connect()
        break
      default:
        wallet = await walletMetamask.connect()
    }
    if (wallet !== null) props.setWallet(wallet)
  }

  return (
    isActive ? <div className={styles.modalContainer} onClick={() => handleClose()}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.walletModalContaier}>
          <h6 className={styles.connectWallet}>
            Connect Wallet
          </h6>
          <div className={styles.walletModalButton} onClick={() => onConnect('metamask')}>
            <img src="/images/metamask.svg" alt='metamask' width="30" height="30" className={styles.marginRight} />
            Metamask
          </div>
          <div className={styles.walletModalButton} onClick={() => onConnect('walletconnect')}>
            <img src="/images/walletconnect.svg" alt='walletconnect' width="30" height="30" className={styles.marginRight} />
            Wallet Connect
          </div>
          <div className={styles.walletModalButton} onClick={() => onConnect('defiwallet')}>
            <img src="/images/crypto.png" alt='crypto' width="30" height="30" className={styles.marginRight} />
            DeFi Wallet Connect
          </div>
        </div>
      </div>
    </div> : ''
  )
}