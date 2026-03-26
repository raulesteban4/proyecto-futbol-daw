import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function Perfil() {
    const { user } = useUser();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (user && user.id) {
            axios.get(`http://localhost:5000/api/pedidos/${user.id}`)
                .then(res => {
                    setPedidos(res.data);
                    setCargando(false);
                })
                .catch(err => {
                    console.error(err);
                    setCargando(false);
                });
        }
    }, [user]);

    if (!user) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Inicia sesión para ver tu perfil</h2>;
    if (cargando) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando tus pedidos...</h2>;

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px' }}>
                Historial de Pedidos de {user.username}
            </h2>
            
            {pedidos.length === 0 ? (
                <p>Aún no has realizado ninguna compra.</p>
            ) : (
                <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>#{p.id}</td>
                                <td style={{ padding: '12px' }}>{new Date(p.fecha).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>{p.total}€</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                        padding: '5px 10px', 
                                        borderRadius: '15px', 
                                        fontSize: '12px',
                                        backgroundColor: p.estado === 'pendiente' ? '#ffeeba' : '#c3e6cb'
                                    }}>
                                        {p.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Perfil;