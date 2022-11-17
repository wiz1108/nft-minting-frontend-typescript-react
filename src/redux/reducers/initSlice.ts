import { createSlice, Slice } from "@reduxjs/toolkit"
import { connectAccount } from "./user"

const appInitializeState: Slice = createSlice({
  name: "appInitialize",
  initialState: {
    initStarted: false,
    publicInitFinished: false,
    authInitFinished: false,
  },
  reducers: {
    appInitStarted(state) {
      state.initStarted = true
    },
    publicInitFinished(state) {
      state.publicInitFinished = true
    },
    appAuthInitFinished(state) {
      state.authInitFinished = true
    },
  },
})

export const appInitializeStateReducer: any = appInitializeState.reducer

/**
 * Runs once to initialize application.
 */

export const appInitStarted = () => async (dispatch: Function) => {
  dispatch(appInitializeState.actions.appInitStarted(null))
}

export const appAuthInitFinished = () => async (dispatch: Function) => {
  dispatch(appInitializeState.actions.appAuthInitFinished(null))
}

export const publicInitFinished = () => async (dispatch: Function) => {
  dispatch(appInitializeState.actions.publicInitFinished(null))
}

export const appInitializer = () => async (dispatch: Function) => {
  dispatch(appInitStarted())

  //  If public routes have initializations then check should be added to Router file to wait for public initialization
  dispatch(publicInitFinished())

  const isConnectSupported =
    localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER") ||
    window.ethereum ||
    localStorage.getItem("DeFiLink_session_storage_extension") ||
    window.navigator.userAgent.includes("Crypto.com DeFiWallet")

  if (!isConnectSupported) {
    dispatch(appAuthInitFinished())
    return
  }

  const web3ModalWillShowUp = !localStorage.getItem(
    "WEB3_CONNECT_CACHED_PROVIDER"
  )

  if (web3ModalWillShowUp) {
    //  Web3Modal will show up. Let the Router redirect the user to main page.
    dispatch(appAuthInitFinished())
  }
  dispatch(connectAccount(true))
}
