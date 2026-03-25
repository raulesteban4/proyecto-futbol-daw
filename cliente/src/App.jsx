import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Plantilla from './pages/Plantilla';
import Tienda from './pages/Tienda';
import Carrito from './pages/Carrito';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plantilla" element={<Plantilla />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App