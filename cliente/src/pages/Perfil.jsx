import { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import './Perfil.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Perfil() {
    const { user } = useUser();
    const [pedidos, setPedidos] = useState([]);
    const [detallesVisibles, setDetallesVisibles] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!user || !user.id) return;
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get(`${API}/api/pedidos/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setPedidos(res.data))
            .catch(err => console.error(err))
            .finally(() => setCargando(false));

        return () => setCargando(false);
    }, [user]);

    const verDetalles = (orderId) => {
        if (detallesVisibles[orderId]) {
            setDetallesVisibles({ ...detallesVisibles, [orderId]: null });
        } else {
            const token = localStorage.getItem('token_fc_canaveral');
            axios.get(`${API}/api/pedidos/detalles/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    setDetallesVisibles({ ...detallesVisibles, [orderId]: res.data });
                })
                .catch(err => console.error(err));
        }
    };

    if (!user) return <h2 className="perfil-mensaje">Inicia sesión para ver tu perfil</h2>;
    if (cargando) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Cargando historial...</p>
            </div>
        );
    }

    return (
        <div className="perfil-container">
            <h2 className="perfil-heading">
                Historial de Pedidos de {user.username}
            </h2>

            {pedidos.length === 0 ? (
                <p className="perfil-vacio">Aún no has realizado ninguna compra.</p>
            ) : (
                <table className="perfil-table">
                    <thead>
                        <tr>
                            <th className="text-left">ID</th>
                            <th className="text-center">Fecha</th>
                            <th className="text-center">Total</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.map(p => (
                            <Fragment key={p.id}>
                                <tr className="pedido-row">
                                    <td className="cell">#{p.id}</td>
                                    <td className="cell text-center">{new Date(p.fecha).toLocaleDateString()}</td>
                                    <td className="cell text-center">{p.total}€</td>
                                    <td className="cell text-center">
                                        <span className={`estado-badge ${p.estado === 'pendiente' ? 'estado-pendiente' : 'estado-enviado'}`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="cell text-center">
                                        <button
                                            className="btn-ver-detalles"
                                            onClick={() => verDetalles(p.id)}
                                        >
                                            {detallesVisibles[p.id] ? 'Ocultar' : 'Ver productos'}
                                        </button>
                                    </td>
                                </tr>
                                {detallesVisibles[p.id] && (
                                    <tr className="detalles-row">
                                        <td colSpan="5">
                                            <ul className="detalles-lista">
                                                {detallesVisibles[p.id].map(item => (
                                                    <li key={item.id}>
                                                        <strong>{item.nombre}</strong> — {item.cantidad} x {item.precio_unitario}€
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Perfil;
