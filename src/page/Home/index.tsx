import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { ToastContainer, toast } from "react-toastify"
import Countdown from 'react-countdown'
import { providers, Contract } from "ethers"

import MyButton from "../../component/Button"
import { chainConfig, liquidContractAddress, passContractAddress } from '../../constants'
import liquidAbi from '../../constants/abi/liquid.json'
import passAbi from '../../constants/abi/pass.json'
import { RootState } from "../../redux/types"
import { capitalize } from '../../utils/methods'

import styles from "./index.module.scss"
import "react-toastify/dist/ReactToastify.css"

let readLiquidContract: Contract
let readPassContract: Contract

const Homepage = () => {
  const [passMinted, setPassMinted] = useState(0)
  const [liquidMinted, setLiquidMinted] = useState(0)
  const walletAddress = useSelector((state: RootState) => {
    return state.user.address
  })
  const liquidContract = useSelector((state: RootState) => {
    return state.user.liquid
  })
  const passContract = useSelector((state: RootState) => {
    return state.user.pass
  })

  useEffect(() => {
    (async () => {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainConfig.chain_id_hex }],
        })
      } catch (switchError: any) {
        console.log('switch error type:', typeof switchError)
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [chainConfig],
            })
          } catch (err) {
            console.log("error adding chain:", err)
          }
        }
      }

      readLiquidContract = new Contract(
        liquidContractAddress,
        liquidAbi,
        new providers.JsonRpcProvider(chainConfig.read_rpc)
      )

      const curLiquidTokenId = await readLiquidContract.currentTokenId()
      setLiquidMinted(curLiquidTokenId.toNumber())

      readPassContract = new Contract(
        passContractAddress,
        passAbi,
        new providers.JsonRpcProvider(chainConfig.read_rpc)
      )

      const curPassTokenId = await readPassContract.currentTokenId()
      setPassMinted(curPassTokenId.toNumber())
    })()
  }, [])

  const mintLiquid = async () => {
    if (!walletAddress) {
      return toast.error('Please connect wallet')
    }
    try {
      if (Date.now() < 1665712800000) {
        return toast.error('Mint Not Started')
      }
      await (await liquidContract.mint(walletAddress)).wait()
      toast.success('Minting Liquid Success')
      const curLiquidTokenId = await readLiquidContract.currentTokenId()
      setLiquidMinted(curLiquidTokenId.toNumber())
    } catch (err: any) {
      toast.error(capitalize(err.reason))
      console.log('Liquid minting error:', { err }, typeof err)
    }
  }

  const mintPass = async () => {
    if (!walletAddress) {
      return toast.error('Please connect wallet')
    }
    try {
      if (Date.now() < 1665712800000) {
        return toast.error('Mint Not Started')
      }
      await (await passContract.mint(walletAddress)).wait()
      toast.success('Minting Pass Success')
      const curPassTokenId = await readPassContract.currentTokenId()
      setPassMinted(curPassTokenId.toNumber())
    } catch (err: any) {
      toast.error(capitalize(err.reason))
      console.log('Pass minting error:', { err })
    }
  }

  const liquidMintRenderer = ({ hours, minutes, seconds, completed }: any) => {
    return completed ? <MyButton text="MINT" onClick={() => mintLiquid()} /> : <MyButton text={`${hours}:${minutes}:${seconds}`} onClick={() => mintLiquid()} />
  }

  const passMintRenderer = ({ hours, minutes, seconds, completed }: any) => {
    return completed ? <MyButton text="MINT" onClick={() => mintPass()} /> : <MyButton text={`${hours}:${minutes}:${seconds}`} onClick={() => mintPass()} />
  }

  return (
    <div className={styles.back}>
      <h1 className={styles.mintCaption}>
        MINT LIQUID NFT
      </h1>
      <div className={styles.main}>{liquidMinted} Liquid Minted</div>
      <Countdown date={1665712800000} renderer={liquidMintRenderer} />
      <h1 className={`${styles.mintCaption} ${styles.topMargin}`}>
        MINT PASS NFT
      </h1>
      <div className={styles.main}>{passMinted} Pass Minted</div>
      <Countdown date={1665712800000} renderer={passMintRenderer} />
      <ToastContainer />
    </div >
  )
}

export default Homepage
