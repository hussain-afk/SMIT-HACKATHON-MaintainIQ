import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import Store from './redux/index.js'
import { Provider } from 'react-redux'
import StoreProvider from './context/Store.jsx'
import './index.css'
import App from './App.jsx'

// This is the very first file that runs.
// Think of it like plugging in all the "power cords" the app needs:
//  - BrowserRouter  -> lets us change pages without reloading the browser
//  - StoreProvider  -> our own simple "who is logged in" box (React Context)
//  - Provider       -> Redux, the box that remembers our list of assets
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
