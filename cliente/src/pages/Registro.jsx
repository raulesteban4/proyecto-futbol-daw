import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

function Registro() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const sanitize = (str) => str.trim().replace(/[<>]/g, '');

    const validate = () => {
        const errs = {};
        const cleanUser = sanitize(username);
        const cleanEmail = sanitize(email);

        if (!cleanUser) {
            errs.username = 'El nombre de usuario es obligatorio';
        } else if (!usernameRegex.test(cleanUser)) {
            errs.username = 'Entre 3 y 30 caracteres (solo letras, números y guion bajo)';
        }

        if (!cleanEmail) {
            errs.email = 'El correo es obligatorio';
        } else if (!emailRegex.test(cleanEmail)) {
            errs.email = 'Introduce un correo válido';
        }

        if (!password) {
            errs.password = 'La contraseña es obligatoria';
        } else if (password.length < 6) {
            errs.password = 'Mínimo 6 caracteres';
        }

        return errs;
    };

    const handleRegistro = (e) => {
        e.preventDefault();
        setErrors({});
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        axios.post(`${API}/api/registro`, {
            username: sanitize(username),
            email: sanitize(email),
            password
        })
            .then(() => {
                navigate('/login');
            })
            .catch(err => {
                if (err.response && err.response.status === 400) {
                    setErrors({ form: err.response.data.message || 'Error al registrar el usuario' });
                } else {
                    setErrors({ form: 'Error al conectar con el servidor' });
                }
                console.error(err);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                {errors.form && <p className="auth-error">{errors.form}</p>}
                <form onSubmit={handleRegistro} className="auth-form" noValidate>
                    <div className="auth-field">
                        <label>Nombre de usuario:</label>
                        <input
                            type="text" placeholder="ej: Juan_12"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                            }}
                            className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
                            required
                            maxLength={30}
                        />
                        {errors.username && <span className="field-error">{errors.username}</span>}
                    </div>
                    <div className="auth-field">
                        <label>Correo electrónico:</label>
                        <input
                            type="email" placeholder="correo@ejemplo.com"
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
                            type="password" placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                            }}
                            className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                            required
                            minLength={6}
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>
                    <button type="submit" className="btn-comprar" disabled={loading}>
                        {loading ? 'Registrando...' : 'REGISTRARSE'}
                    </button>
                </form>
                <p className="auth-footer">
                    ¿Ya tienes cuenta?
                    <span onClick={() => navigate('/login')} className="auth-link">
                        &nbsp;Inicia sesión aquí
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Registro;
