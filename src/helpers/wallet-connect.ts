import { ethers } from "ethers"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { chainConfig } from "../constants"

export const connect = async () => {
  try {
    localStorage.clear()
    const provider = new WalletConnectProvider({
      rpc: {
        [chainConfig.chain_id]: chainConfig.read_rpc,
      },
      chainId: Number(chainConfig.chain_id),
    })
    await provider.enable()
    const ethersProvider = new ethers.providers.Web3Provider(provider)
    if (!(provider.chainId === Number(chainConfig.chain_id))) {
      window.alert(
        "Switch your Wallet to blockchain network " + chainConfig.name
      )
      return null
    }
    // provider.on("accountsChanged", utils.reloadApp)
    // provider.on("chainChanged", utils.reloadApp)
    // provider.on("disconnect", utils.reloadApp)
    return {
      walletProviderName: "walletconnect",
      address: (await ethersProvider.listAccounts())[0],
      browserWeb3Provider: ethersProvider,
      serverWeb3Provider: new ethers.providers.JsonRpcProvider(
        chainConfig.read_rpc
      ),
      wcProvider: provider,
      connected: true,
      chainId: provider.chainId,
    }
  } catch (e) {
    return null
  }
}
