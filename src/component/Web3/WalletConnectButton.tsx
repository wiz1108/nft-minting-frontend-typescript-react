import { memo, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import MetaMaskOnboarding from "@metamask/onboarding"

import { RootState } from "../../redux/types"

import {
  connectAccount,
  onLogout,
  setShowWrongChainModal,
  chainConnect
} from "../../redux/reducers/user"
import { useDetectOutsideClick } from '../../utils/hooks'
import styles from './index.module.scss'

const WalletConnectButton = () => {
  const dispatch = useDispatch()
  const modalRef = useRef(null)
  const user = useSelector((state: RootState) => {
    return state.user
  })
  const [isActive, setIsActive] = useDetectOutsideClick(modalRef, user.showWrongChainModal)

  const walletAddress = useSelector((state: RootState) => {
    return state.user.address
  })

  const correctChain = useSelector((state: RootState) => {
    return state.user.correctChain
  })
  const needsOnboard = useSelector((state: RootState) => {
    return state.user.needsOnboard
  })

  useEffect(() => {
    setIsActive(user.showWrongChainModal)
  }, [user.showWrongChainModal, setIsActive])

  const logout = async () => {
    dispatch(onLogout())
  }

  const connectWalletPressed = async () => {
    if (needsOnboard) {
      const onboarding = new MetaMaskOnboarding()
      onboarding.startOnboarding()
    } else {
      dispatch(connectAccount())
    }
  }

  useEffect(() => {
    let defiLink = localStorage.getItem("DeFiLink_session_storage_extension")
    if (defiLink) {
      try {
        const json = JSON.parse(defiLink)
        if (!json.connected) {
          dispatch(onLogout())
        }
      } catch (error) {
        dispatch(onLogout())
      }
    }
    if (
      localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") ||
      window.ethereum ||
      localStorage.getItem("DeFiLink_session_storage_extension")
    ) {
      if (!user.provider) {
        if (window.navigator.userAgent.includes("Crypto.com DeFiWallet")) {
          dispatch(connectAccount(false, "defi"))
        } else {
          dispatch(connectAccount())
        }
      }
    }
    if (!user.provider) {
      if (window.navigator.userAgent.includes("Crypto.com DeFiWallet")) {
        dispatch(connectAccount(false, "defi"))
      }
    }

    // eslint-disable-next-line
  }, [])

  const onWrongChainModalClose = () => {
    dispatch(setShowWrongChainModal(false))
  }

  const onWrongChainModalChangeChain = () => {
    dispatch(setShowWrongChainModal(false))
    dispatch(chainConnect())
  }

  console.log("user:", user)
  console.log('isaclive:', isActive)

  return (
    <div>
      {(walletAddress === '' || walletAddress === null || walletAddress === undefined) ? (
        <div className={styles.walletButton}
          onClick={connectWalletPressed}>
          Connect wallet
        </div>
      ) : ''}
      {walletAddress && !correctChain && !isActive && (
        <div className={styles.walletButton}
          onClick={onWrongChainModalChangeChain}
        >
          Switch Network
        </div>
      )}
      {walletAddress && correctChain && (
        <div className={styles.walletButton}
          onClick={() => logout()}
        >{`${walletAddress.substr(0, 6)}...${walletAddress.substr(
          walletAddress.length - 4,
          4
        )}`}</div>
      )}

      {isActive ? <div className={styles.modalContainer}>
        <div className={styles.modal} ref={modalRef}>
          <h2>Wrong network</h2>
          <div>
            To continue, you need to switch the network to{" "}
            <span style={{ fontWeight: "bold" }}>Goerli Chain</span>.{" "}
          </div>
          <div>
            <button
              className="p-4 pt-2 pb-2 btn_menu inline white lead"
              onClick={onWrongChainModalClose}
            >
              Close
            </button>
            <button
              className="p-4 pt-2 pb-2 btn_menu inline white lead btn-outline"
              onClick={onWrongChainModalChangeChain}
            >
              Switch
            </button>
          </div>
        </div>
      </div> : ''
      }
    </div>
  )
}
export default memo(WalletConnectButton)
