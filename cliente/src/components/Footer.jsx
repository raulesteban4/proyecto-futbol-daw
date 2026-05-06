import { useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer() {
    const navigate = useNavigate();
    const year = new Date().getFullYear();

    const links = [
        { label: 'Inicio', path: '/' },
        { label: 'Plantilla', path: '/plantilla' },
        { label: 'Competición', path: '/competicion' },
        { label: 'Tienda', path: '/tienda' },
        { label: 'Perfil', path: '/perfil' },
    ];

    return (
        <footer className="footer">
            <div className="footer__inner">
                <span>© {year} FC Cañaveral</span>
                <nav className="footer__nav">
                    {links.map(l => (
                        <button key={l.path} onClick={() => navigate(l.path)}>
                            {l.label}
                        </button>
                    ))}
                </nav>
            </div>
        </footer>
    );
}

export default Footer;
