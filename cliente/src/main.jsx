import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext'
import { UserProvider } from './context/UserContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider> 
      <CartProvider>
        <App />
      </CartProvider>
    </UserProvider>
  </React.StrictMode>
)