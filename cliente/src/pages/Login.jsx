import { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useUser();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post(`${API}/api/login`, { email, password })
            .then(res => {
                const { user, token } = res.data;
                localStorage.setItem('token_fc_canaveral', token);
                login(user);
                alert(`¡Bienvenido de nuevo, ${user.username}!`);
                if (user.rol === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    alert("Correo o contraseña incorrectos");
                } else {
                    alert("Error al conectar con el servidor");
                }
                console.error(err);
            });
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="auth-field">
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-comprar" style={{ marginTop: '10px' }}>
                        ENTRAR
                    </button>
                </form>
                <p className="auth-footer">
                    ¿No tienes cuenta?
                    <span onClick={() => navigate('/registro')} className="auth-link">
                        &nbsp;Regístrate aquí
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;
