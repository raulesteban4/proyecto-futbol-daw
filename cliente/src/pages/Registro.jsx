import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registro() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegistro = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/api/registro', { username, email, password })
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
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div className="tarjeta-jugador" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e3a8a' }}>Crear Cuenta</h2>
                <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" placeholder="Nombre de usuario" 
                        value={username} onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required 
                    />
                    <input 
                        type="email" placeholder="Correo electrónico" 
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required 
                    />
                    <input 
                        type="password" placeholder="Contraseña" 
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} required 
                    />
                    <button type="submit" className="btn-comprar">REGISTRARSE</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                        ¿Ya tienes cuenta?
                    <span onClick={() => navigate('/login')} style={{ color: '#1e3a8a', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                        &nbsp;Inicia sesion aquí
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Registro;