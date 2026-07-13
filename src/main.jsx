import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom";
import Store from './redux/index.js'
import { Provider } from 'react-redux'
import StoreProvider from './context/Store.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Provider store={Store}>
          <App />
        </Provider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
