import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import './Navbar.css';

function Navbar() {
    const { cart } = useCart();
    const { user, logout } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo" onClick={closeMenu}>
                <span>⚽</span> FC Cañaveral
            </Link>

            {/* --- NAVEGACIÓN DESKTOP --- */}
            <div className="nav-links-desktop">
                <Link to="/">Inicio</Link>
                <Link to="/plantilla">Plantilla</Link>
                <Link to="/competicion">Competición</Link>
                <Link to="/tienda">Tienda</Link>
                {user && user.rol === 'admin' && (
                    <Link to="/admin" className="admin-link">Gestión</Link>
                )}
            </div>

            <div className="nav-user-desktop">
                <Link to="/carrito" className="cart-link">
                    🛒 Carrito({totalItems})
                </Link>
                {!user ? (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-link">Entrar</Link>
                        <Link to="/registro" className="register-btn">Registro</Link>
                    </div>
                ) : (
                    <div className="user-info">
                        <Link to="/perfil">👤 {user.username}</Link>
                        <button onClick={handleLogout} className="btn-salir">Salir</button>
                    </div>
                )}
            </div>

            {/* --- BOTÓN HAMBURGUESA --- */}
            <button 
                className={`hamburger ${menuOpen ? 'active' : ''}`} 
                onClick={toggleMenu}
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            {/* --- MENÚ MÓVIL (Se despliega) --- */}
            <div className={`nav-mobile ${menuOpen ? 'active' : ''}`}>
                <div className="mobile-links">
                    <Link to="/" onClick={closeMenu}>Inicio</Link>
                    <Link to="/plantilla" onClick={closeMenu}>Plantilla</Link>
                    <Link to="/competicion" onClick={closeMenu}>Competición</Link>
                    <Link to="/tienda" onClick={closeMenu}>Tienda</Link>
                    
                    {user && user.rol === 'admin' && (
                        <Link to="/admin" className="admin-link" onClick={closeMenu}>Gestión</Link>
                    )}
                </div>

                <hr className="mobile-divider" />

                <div className="mobile-user-section">
                    <Link to="/carrito" onClick={closeMenu}>🛒 Mi Carrito ({totalItems})</Link>
                    {!user ? (
                        <div className="mobile-auth-grid">
                            <Link to="/login" onClick={closeMenu} className="mobile-login">Entrar</Link>
                            <Link to="/registro" onClick={closeMenu} className="mobile-register">Registrarse</Link>
                        </div>
                    ) : (
                        <div className="mobile-auth-grid">
                            <Link to="/perfil" onClick={closeMenu}>👤 Mi Perfil</Link>
                            <button onClick={handleLogout} className="mobile-btn-salir">Cerrar Sesión</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;