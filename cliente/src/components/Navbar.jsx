import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/FC CAÑAVERAL escudo.avif';
import './Navbar.css';

function Navbar() {
    const { cart } = useCart();
    const { user, logout } = useUser();
    const { dark, toggle } = useTheme();
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
                <img src={logo} alt="FC Cañaveral Logo" className="navbar-logo-img" /> FC Cañaveral
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
                <button onClick={toggle} className="theme-toggle" aria-label="Cambiar tema">
                    {dark ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                    )}
                </button>
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

                <div className="mobile-theme-toggle">
                    <button onClick={toggle} className="mobile-theme-btn">
                        {dark ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                        )}
                        <span>{dark ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                </div>

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