import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function Perfil() {
    const { user } = useUser();
    const [pedidos, setPedidos] = useState([]);
    const [detallesVisibles, setDetallesVisibles] = useState({}); // Para controlar qué pedido está abierto

    useEffect(() => {
        if (user && user.id) {
            const token = localStorage.getItem('token_fc_canaveral');
            axios.get(`http://localhost:5000/api/pedidos/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => setPedidos(res.data))
                .catch(err => console.error(err));
        }
    }, [user]);

    const verDetalles = (orderId) => {
        // Si ya tenemos los detalles cargados, solo cerramos/abrimos el desplegable
        if (detallesVisibles[orderId]) {
            setDetallesVisibles({ ...detallesVisibles, [orderId]: null });
        } else {
            // Si no, los pedimos al servidor
            const token = localStorage.getItem('token_fc_canaveral');
            axios.get(`http://localhost:5000/api/pedidos/detalles/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    setDetallesVisibles({ ...detallesVisibles, [orderId]: res.data });
                })
                .catch(err => console.error(err));
        }
    };

    if (!user) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Inicia sesión para ver tu perfil</h2>;
    
    return (
        <div style={{ maxWidth: '900px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '10px' }}>
                Historial de Pedidos de {user.username}
            </h2>
            
            {pedidos.length === 0 ? (
                <p style={{ marginTop: '20px' }}>Aún no has realizado ninguna compra.</p>
            ) : (
                <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f4' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map(p => (
                            <div key={p.id} style={{ display: 'contents' }}>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>#{p.id}</td>
                                    <td style={{ padding: '12px' }}>{new Date(p.fecha).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px' }}>{p.total}€</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '5px 10px', 
                                            borderRadius: '15px', 
                                            fontSize: '12px',
                                            backgroundColor: p.estado === 'pendiente' ? '#ffeeba' : '#c3e6cb',
                                            color: p.estado === 'pendiente' ? '#856404' : '#155724'
                                        }}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => verDetalles(p.id)}
                                            style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            {detallesVisibles[p.id] ? 'Ocultar' : 'Ver productos'}
                                        </button>
                                    </td>
                                </tr>
                                {/* Desplegable de productos */}
                                {detallesVisibles[p.id] && (
                                    <tr>
                                        <td colSpan="5" style={{ backgroundColor: '#fdfdfd', padding: '15px', borderLeft: '4px solid #1e3a8a' }}>
                                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                                {detallesVisibles[p.id].map(item => (
                                                    <li key={item.id} style={{ padding: '8px 0', borderBottom: '1px dashed #eee', fontSize: '14px' }}>
                                                        <strong>{item.nombre}</strong> — {item.cantidad} x {item.precio_unitario}€
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </div>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Perfil;