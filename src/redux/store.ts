import { applyMiddleware, compose, createStore, combineReducers } from 'redux'

import thunk from 'redux-thunk'

import { appInitializeStateReducer } from './reducers/initSlice'
import { user } from './reducers/user'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
  }
}

const rootReducer = combineReducers({
  user: user,
  appInitialize: appInitializeStateReducer,
})

const middleware = applyMiddleware(thunk)

const store = createStore(rootReducer, middleware)

export default store
