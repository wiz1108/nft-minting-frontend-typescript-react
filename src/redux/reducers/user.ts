import { createSlice } from "@reduxjs/toolkit"
import { Contract, ethers, BigNumber } from "ethers"
import Web3Modal from "web3modal"
import detectEthereumProvider from "@metamask/detect-provider"
// import { DeFiWeb3Connector } from 'deficonnect'
import WalletConnectProvider from "@walletconnect/web3-provider"
// import * as DefiWalletConnectProvider from '@deficonnect/web3-provider'
import { appAuthInitFinished } from "./initSlice"
import { captureException } from "@sentry/react"
import liquidAbi from '../../constants/abi/liquid.json'
import passAbi from '../../constants/abi/pass.json'
import {
  liquidContractAddress,
  passContractAddress,
  ChainConfig,
  chainConfig,
} from "../../constants/"

let chainInfo: ChainConfig
const userSlice: any = createSlice({
  name: "user",
  initialState: {
    // Wallet
    provider: null,
    address: null,
    web3modal: null,
    connectingWallet: false,
    gettingContractData: true,
    needsOnboard: false,
    // Contracts
    liquid: null,
    pass: null,
    correctChain: false,
    showWrongChainModal: false,
    balance: null
  },
  reducers: {
    accountChanged(state, action) {
      state.balance = action.payload.balance
      state.liquid = action.payload.liquid
      state.pass = action.payload.pass
    },

    onCorrectChain(state, action) {
      state.correctChain = action.payload.correctChain
    },

    onProvider(state, action) {
      state.provider = action.payload.provider
      state.needsOnboard = action.payload.needsOnboard
      state.correctChain = action.payload.correctChain
    },

    onBasicAccountData(state, action) {
      state.address = action.payload.address
      state.provider = action.payload.provider
      state.web3modal = action.payload.web3modal
      state.correctChain = action.payload.correctChain
      state.needsOnboard = action.payload.needsOnboard
    },

    connectingWallet(state, action) {
      state.connectingWallet = action.payload.connecting
    },

    setShowWrongChainModal(state, action) {
      state.showWrongChainModal = action.payload
    },
    onLogout(state: any) {
      state.connectingWallet = false
      const web3Modal: Web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        // providerOptions: [], // required
      })
      web3Modal.clearCachedProvider()
      if (state.web3modal != null) {
        state.web3modal.clearCachedProvider()
      }
      state.web3modal = null
      state.provider = null
      localStorage.clear()
      state.address = ""
      state.balance = null
    },
    balanceUpdated(state, action) {
      state.balance = action.payload
    },
  },
})

export const {
  accountChanged,
  onProvider,
  connectingWallet,
  onCorrectChain,
  setShowWrongChainModal,
  onBasicAccountData,
  onLogout,
} = userSlice.actions
export const user = userSlice.reducer

export const connectAccount: Function =
  (firstRun = false, type = "") =>
    async (dispatch: Function) => {
      // const currentlyPath = window.location.pathname

      chainInfo = chainConfig
      const providerOptions: any = {
        injected: {
          display: {
            logo: "https://github.com/MetaMask/brand-resources/raw/master/SVG/metamask-fox.svg",
            name: "MetaMask",
            description: "Connect with MetaMask in your browser",
          },
          package: null,
        },
      }

      if (type !== "defi") {
        providerOptions.walletconnect = {
          package: WalletConnectProvider, // required
          options: {
            chainId: 4,
            // chainId: 25,
            rpc: {
              4: "https://rinkeby.infura.io/v3/33f72aa1b4f441bc8f3a244da53533b4",
              25: "https://cronosrpc-1.xstaking.sg",
            },
            network: "cronos",
            metadata: {
              icons: ["https://ebisusbay.com/vector%20-%20face.svg"],
            },
          },
        }
      }

      const web3ModalWillShowUp = !localStorage.getItem(
        "WEB3_CONNECT_CACHED_PROVIDER"
      )

      if (process.env.NODE_ENV !== "production") {
        console.log("web3ModalWillShowUp: ", web3ModalWillShowUp)
      }

      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })

      const web3provider = await web3Modal
        .connect()
        .then((web3provider) => web3provider)
        .catch((error) => {
          captureException(error, { extra: { firstRun } })
          console.log("Could not get a wallet connection", error)
          return null
        })

      if (!web3provider) {
        dispatch(onLogout())
        return
      }

      try {
        dispatch(connectingWallet({ connecting: true }))
        const provider = new ethers.providers.Web3Provider(web3provider)

        const cid = await web3provider.request({
          method: "net_version",
        })
        const correctChain =
          cid === chainInfo.chain_id || cid === Number(chainInfo.chain_id)

        const accounts = await web3provider.request({
          method: "eth_accounts",
          params: [{ chainId: cid }],
        })

        const address = accounts[0]
        const signer = provider.getSigner()

        if (!correctChain) {
          if (firstRun) {
            dispatch(appAuthInitFinished())
          }
          await dispatch(setShowWrongChainModal(true))
        }

        await dispatch(
          onBasicAccountData({
            address: address,
            provider: provider,
            web3modal: web3Modal,
            needsOnboard: false,
            correctChain: correctChain,
          })
        )
        if (firstRun) {
          dispatch(appAuthInitFinished())
        }
        web3provider.on("DeFiConnectorDeactivate", () => {
          dispatch(onLogout())
        })

        web3provider.on("disconnect", () => {
          dispatch(onLogout())
        })

        web3provider.on("accountsChanged", () => {
          dispatch(onLogout())
          dispatch(connectAccount())
        })

        web3provider.on("DeFiConnectorUpdate", () => {
          window.location.reload()
        })

        web3provider.on("chainChanged", () => {
          // Handle the new chain.
          // Correctly handling chain changes can be complicated.
          // We recommend reloading the page unless you have good reason not to.

          window.location.reload()
        })

        let balance
        let liquid
        let pass

        if (signer && correctChain) {
          liquid = new Contract(liquidContractAddress, liquidAbi, signer)
          pass = new Contract(passContractAddress, passAbi, signer)

          try {
            balance = ethers.utils.formatEther(
              await provider.getBalance(address)
            )
          } catch (error) {
            console.log("Error checking CRO balance", error)
          }
        }

        await dispatch(
          accountChanged({
            address: address,
            provider: provider,
            web3modal: web3Modal,
            needsOnboard: false,
            correctChain: correctChain,
            balance: balance,
            liquid,
            pass,
          })
        )
      } catch (error) {
        captureException(error, {
          extra: {
            firstRun,
            WEB3_CONNECT_CACHED_PROVIDER: localStorage.getItem(
              "WEB3_CONNECT_CACHED_PROVIDER"
            ),
            DeFiLink_session_storage_extension: localStorage.getItem(
              "DeFiLink_session_storage_extension"
            ),
          },
        })
        if (firstRun) {
          dispatch(appAuthInitFinished())
        }
        console.log("Error connecting wallet!", error)
        await web3Modal.clearCachedProvider()
        dispatch(onLogout())
      }
      dispatch(connectingWallet({ connecting: false }))
    }

export const initProvider = () => async (dispatch: Function) => {
  const ethereum = await detectEthereumProvider()

  if (ethereum == null || ethereum !== window.ethereum) {
    console.log("not metamask detected")
  } else {
    const provider = new ethers.providers.Web3Provider(ethereum)

    provider.on("accountsChanged", (accounts) => {
      dispatch(
        accountChanged({
          address: accounts[0],
        })
      )
    })

    provider.on("chainChanged", (chainId) => {
      // Handle the new chain.
      // Correctly handling chain changes can be complicated.
      // We recommend reloading the page unless you have good reason not to.

      window.location.reload()
    })
  }
}

export const chainConnect: Function = () => async (dispatch: Function) => {
  if (window.ethereum) {
    const cid = ethers.utils.hexValue(BigNumber.from(chainInfo.chain_id))
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: cid }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: chainInfo.name,
                chainId: cid,
                rpcUrls: [chainInfo.write_rpc],
                blockExplorerUrls: null,
                nativeCurrency: {
                  name: chainInfo.name,
                  symbol: chainInfo.symbol,
                  decimals: 18,
                },
              },
            ],
          })
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: cid }],
          })
        } catch (addError) {
          console.error(addError)
          window.location.reload()
        }
      }
      console.log(error)
    }
  } else {
    // eslint-disable-next-line
    const web3Provider = new WalletConnectProvider({
      infuraId: "33f72aa1b4f441bc8f3a244da53533b4",
      rpc: {
        4: "https://rinkeby.infura.io/v3/33f72aa1b4f441bc8f3a244da53533b4",
        25: "https://cronosrpc-1.xstaking.sg",
      },
      chainId: 4,
      // chainId: 25
    })
  }
}

export const updateBalance = () => async (dispatch: Function, getState: Function) => {
  const { user } = getState()
  const { address, provider } = user
  const balance = ethers.utils.formatEther(await provider.getBalance(address))
  dispatch(userSlice.actions.balanceUpdated(balance))
}
