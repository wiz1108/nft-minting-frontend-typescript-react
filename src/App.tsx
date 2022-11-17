import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import { Provider } from 'react-redux'

import Home from './page/Home'
import Header from './component/Layouts/Header'
import Footer from './component/Layouts/Footer'
import Background from './component/Background'

import store from './redux/store'

function App() {
  return (
    <Provider store={store}>
      <Background>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </Background>
    </Provider>
  )
}

export default App
