import { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const { login } = useUser();
    const navigate = useNavigate();

    const sanitize = (str) => str.trim().replace(/[<>]/g, '');

    const validate = () => {
        const errs = {};
        const cleanEmail = sanitize(email);
        if (!cleanEmail) {
            errs.email = 'El correo es obligatorio';
        } else if (!emailRegex.test(cleanEmail)) {
            errs.email = 'Introduce un correo válido';
        }
        if (!password.trim()) {
            errs.password = 'La contraseña es obligatoria';
        }
        return errs;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setErrors({});
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        axios.post(`${API}/api/login`, { email: sanitize(email), password })
            .then(res => {
                const { user, token } = res.data;
                localStorage.setItem('token_fc_canaveral', token);
                login(user);
                if (user.rol === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    setErrors({ form: 'Correo o contraseña incorrectos' });
                } else {
                    setErrors({ form: 'Error al conectar con el servidor' });
                }
                console.error(err);
            });
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>
                {errors.form && <p className="auth-error">{errors.form}</p>}
                <form onSubmit={handleLogin} className="auth-form" noValidate>
                    <div className="auth-field">
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                            required
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>
                    <div className="auth-field">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                            }}
                            className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                            required
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
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
