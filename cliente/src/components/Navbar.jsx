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
                {!user ? (
                    <>
                        <Link to="/login" className="nav-link">ENTRAR</Link>
                        <Link to="/registro" className="nav-link">REGISTRARSE</Link>
                    </>
                ) : (
                    <div className="user-info">
                        <Link to="/perfil" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span>👤 {user.username}</span>
                        </Link>
                        &nbsp;
                        <button onClick={logout} className="btn-salir">Salir</button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;