import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Registro() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegistro = (e) => {
        e.preventDefault();
        axios.post(`${API}/api/registro`, { username, email, password })
            .then(res => {
                alert("¡Registro completado! Ahora puedes iniciar sesión.");
                navigate('/login');
            })
            .catch(err => {
                alert("Error al registrar el usuario. Puede que el email ya exista.");
                console.error(err);
            });
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <form onSubmit={handleRegistro} className="auth-form">
                    <input
                        type="text" placeholder="Nombre de usuario"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        className="auth-input" required
                    />
                    <input
                        type="email" placeholder="Correo electrónico"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="auth-input" required
                    />
                    <input
                        type="password" placeholder="Contraseña"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="auth-input" required
                    />
                    <button type="submit" className="btn-comprar">REGISTRARSE</button>
                </form>
                <p className="auth-footer">
                    ¿Ya tienes cuenta?
                    <span onClick={() => navigate('/login')} className="auth-link">
                        &nbsp;Inicia sesion aquí
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Registro;
