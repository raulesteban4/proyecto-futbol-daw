import { useNavigate } from 'react-router-dom';
import logo from '../assets/FC CAÑAVERAL escudo.avif';
import './Footer.css';

const links = [
    { label: 'Inicio', path: '/' },
    { label: 'Plantilla', path: '/plantilla' },
    { label: 'Competición', path: '/competicion' },
    { label: 'Tienda', path: '/tienda' },
    { label: 'Carrito', path: '/carrito' },
    { label: 'Perfil', path: '/perfil' },
];

function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="footer">
            <div className="footer__inner">
                <img src={logo} alt="" className="footer__logo" />
                <nav className="footer__nav">
                    {links.map(l => (
                        <button key={l.path} onClick={() => navigate(l.path)}>
                            {l.label}
                        </button>
                    ))}
                </nav>
                <p className="footer__copy">© {new Date().getFullYear()} FC Cañaveral</p>
            </div>
        </footer>
    );
}

export default Footer;
