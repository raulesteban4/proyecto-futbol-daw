import { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useUser(); // Sacamos la función para guardar al usuario
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Llamamos a la API que creamos antes en el servidor
        axios.post('http://localhost:5000/api/login', { email, password })
            .then(res => {
                login(res.data); // Guardamos los datos (nombre, rol, id...)
                alert(`¡Bienvenido de nuevo, ${res.data.username}!`);
                navigate('/'); // Nos lleva al inicio automáticamente
            })
            .catch(err => {
                alert("Email o contraseña incorrectos");
                console.error(err);
            });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div className="tarjeta-jugador" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e3a8a' }}>Iniciar Sesión</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-comprar" style={{ marginTop: '10px' }}>
                        ENTRAR
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                        ¿No tienes cuenta?
                    <span onClick={() => navigate('/registro')} style={{ color: '#1e3a8a', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                        &nbsp;Regístrate aquí
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;