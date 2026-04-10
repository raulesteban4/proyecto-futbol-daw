import { BrowserRouter, Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Plantilla from './pages/Plantilla';
import Tienda from './pages/Tienda';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import Competicion from './pages/Competicion';
import AdminDashboard from './pages/AdminDashboard';
import Confirmacion from './pages/Confirmacion';

function App() {
  const { user } = useUser();
  return (
    <BrowserRouter>
      <Navbar />
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plantilla" element={<Plantilla />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/competicion" element={<Competicion />} />
          <Route
            path="/admin"
            element={
              user && user.rol === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/confirmacion" element={<Confirmacion />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App