import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import './Navbar.css';

function Navbar() {
    const { cart } = useCart();
    const { user, logout } = useUser();
    // Sumamos todas las cantidades de los productos en el carrito
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    return (
    <nav className="navbar">
  <div className="nav-links">
    <Link to="/">INICIO</Link>
    <Link to="/plantilla">PLANTILLA</Link>
    <Link to="/tienda">TIENDA</Link>
  </div>
  <div className="nav-user">
    <Link to="/carrito" className="cart-link">🛒 Carrito ({totalItems})</Link>
    {user ? (
      <>
        <span>👤 {user.username}</span>
        <button onClick={logout} className="btn-logout">Salir</button>
      </>
    ) : (
      <Link to="/login" className="login-link">ENTRAR</Link>
    )}
  </div>
</nav>
  );
}

export default Navbar;