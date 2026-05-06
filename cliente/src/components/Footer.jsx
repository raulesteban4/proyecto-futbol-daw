import { useNavigate } from 'react-router-dom';
import logo from '../assets/FC CAÑAVERAL escudo.avif';
import './Footer.css';

function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <img src={logo} alt="FC Cañaveral" className="footer__logo" />
                    <div className="footer__brand-text">
                        <strong>FC Cañaveral</strong>
                        <p>El club de fútbol que une a la comunidad</p>
                    </div>
                </div>

                <div className="footer__links">
                    <div className="footer__col">
                        <h4>Club</h4>
                        <button onClick={() => navigate('/')}>Inicio</button>
                        <button onClick={() => navigate('/plantilla')}>Plantilla</button>
                        <button onClick={() => navigate('/competicion')}>Competición</button>
                    </div>
                    <div className="footer__col">
                        <h4>Tienda</h4>
                        <button onClick={() => navigate('/tienda')}>Productos</button>
                        <button onClick={() => navigate('/carrito')}>Mi Carrito</button>
                    </div>
                    <div className="footer__col">
                        <h4>Cuenta</h4>
                        <button onClick={() => navigate('/perfil')}>Mi Perfil</button>
                        <button onClick={() => navigate('/registro')}>Registro</button>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>© {new Date().getFullYear()} FC Cañaveral. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
