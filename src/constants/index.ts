export const liquidContractAddress: string = '0x0912422b35dC57a50fd8f58d3B4104Bad5176fb4'
export const passContractAddress: string = '0x77CAba7aF139E2acb76111Fab426eCe5Dfff8E08'

export interface ChainConfig {
  name: string;
  chain_id: string;
  chain_id_hex: string;
  write_rpc: string;
  read_rpc: string;
  symbol: string;
  explorer: string;
}

export const chainConfig: ChainConfig = {
  name: "Goerli Testnet",
  chain_id: "5",
  chain_id_hex: "0x5",
  write_rpc: "https://goerli.infura.io/v3/33f72aa1b4f441bc8f3a244da53533b4",
  read_rpc: "https://goerli.infura.io/v3/33f72aa1b4f441bc8f3a244da53533b4",
  symbol: "GETH",
  explorer: "https://goerli.etherscan.io/",
}