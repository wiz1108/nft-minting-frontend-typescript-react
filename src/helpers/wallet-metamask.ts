import { ethers } from "ethers"
import { chainConfig } from "../constants"

const hexToInt = (s: string) => {
  const bn = ethers.BigNumber.from(s)
  return parseInt(bn.toString())
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainConfig.chain_id_hex }],
    })
  } catch (e) {
    console.log(e)
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainConfig.chain_id_hex,
          chainName: chainConfig.name,
          rpcUrls: [chainConfig.read_rpc],
          nativeCurrency: chainConfig.symbol,
          blockExplorerUrls: [chainConfig.explorer],
        },
      ],
    })
  }
}

export const connect = async () => {
  try {
    let chainId = await window.ethereum.request({ method: "eth_chainId" })
    if (!(chainId === chainConfig.chain_id_hex)) {
      await switchNetwork()
      await delay(2000)
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    // window.ethereum.on("chainChanged", utils.reloadApp)
    // window.ethereum.on("accountsChanged", utils.reloadApp)
    // window.ethereum.on("disconnect", utils.reloadApp)

    return {
      walletProviderName: "metamask",
      address: accounts[0],
      browserWeb3Provider: new ethers.providers.Web3Provider(window.ethereum),
      serverWeb3Provider: new ethers.providers.JsonRpcProvider(
        chainConfig.read_rpc
      ),
      connected: true,
      chainId: hexToInt(
        await window.ethereum.request({ method: "eth_chainId" })
      ),
    }
  } catch (e) {
    console.log("error:", e)
    return null
  }
}
