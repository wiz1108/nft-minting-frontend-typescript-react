import { ethers } from "ethers"
import { DeFiWeb3Connector } from "deficonnect"
import { chainConfig } from "../constants"

export const connect = async () => {
  try {
    const connector = new DeFiWeb3Connector({
      supportedChainIds: [Number(chainConfig.chain_id)],
      rpc: {
        [chainConfig.chain_id]: chainConfig.read_rpc,
      },
      pollingInterval: 15000,
    })
    await connector.activate()
    const provider = await connector.getProvider()
    const web3Provider = new ethers.providers.Web3Provider(provider)
    if (!(parseInt(provider.chainId) === Number(chainConfig.chain_id))) {
      window.alert(
        "Switch your Wallet to blockchain network " + chainConfig.name
      )
      return null
    }

    // connector.on("session_update", utils.reloadApp)
    // connector.on("Web3ReactDeactivate", utils.reloadApp)
    // connector.on("Web3ReactUpdate", utils.reloadApp)

    return {
      walletProviderName: "defiwallet",
      address: (await web3Provider.listAccounts())[0],
      browserWeb3Provider: web3Provider,
      serverWeb3Provider: new ethers.providers.JsonRpcProvider(
        chainConfig.read_rpc
      ),
      wcProvider: provider,
      wcConnector: connector,
      connected: true,
      chainId: provider.chainId,
    }
  } catch (e) {
    window.alert(e)
    return null
  }
}
