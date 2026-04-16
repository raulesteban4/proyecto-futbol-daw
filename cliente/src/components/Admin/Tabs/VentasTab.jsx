import { useState } from 'react';
import axios from 'axios';
import './tabs.css';

function VentasTab({ data, setData, stats }) {
    const [busqueda, setBusqueda] = useState('');
    const [soloPendientes, setSoloPendientes] = useState(false);

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get('http://localhost:5000/api/admin/ventas', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar ventas:", err));
    };

    const cardStatStyle = (bgColor, textColor) => ({
        backgroundColor: bgColor,
        color: textColor,
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        textAlign: 'center',
        border: `1px solid ${textColor}20`
    });

    return data && data.length > 0 ? (
        <div>
            {/* Grid de 6 tarjetas de estadísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                marginBottom: '30px'
            }}>
                {/* 1. Recaudación */}
                <div style={cardStatStyle('#eff6ff', '#1e40af')}>
                    <span style={{ fontSize: '0.85rem' }}>Recaudación Total</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.totalRecaudado || 0}€</h2>
                </div>

                {/* 2. Producto Estrella */}
                <div style={cardStatStyle('#fff7ed', '#9a3412')}>
                    <span style={{ fontSize: '0.85rem' }}>Producto Estrella</span>
                    <h2 style={{ margin: '5px 0', fontSize: '1.1rem' }}>{stats.productoEstrella || '---'}</h2>
                </div>

                {/* 3. Stock Crítico */}
                <div style={cardStatStyle('#fef2f2', '#991b1b')}>
                    <span style={{ fontSize: '0.85rem' }}>Stock Bajo</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.stockBajo || 0} producto</h2>
                </div>

                {/* 4. Enviados */}
                <div style={cardStatStyle('#f0fdf4', '#15803d')}>
                    <span style={{ fontSize: '0.85rem' }}>Enviados</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.pedidosEnviados || 0}</h2>
                </div>

                {/* 5. Pendientes */}
                <div style={cardStatStyle('#fffbeb', '#b45309')}>
                    <span style={{ fontSize: '0.85rem' }}>Pendientes</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.pedidosPendientes || 0}</h2>
                </div>

                {/* 6. Total de Pedidos */}
                <div style={cardStatStyle('#f8fafc', '#475569')}>
                    <span style={{ fontSize: '0.85rem' }}>Total Histórico</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.totalPedidos || 0}</h2>
                </div>
            </div>

            {/*tabla de ventas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
                <h3>Detalle de Transacciones</h3>

                <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                    {/* BUSCADOR POR EMAIL O ID */}
                    <input
                        type="text"
                        placeholder="Buscar por Email o ID..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            width: '250px'
                        }}
                    />

                    <button
                        onClick={() => setSoloPendientes(!soloPendientes)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: soloPendientes ? 'rgb(223, 185, 86)' : '#d2d8e3',
                            color: soloPendientes ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {soloPendientes ? 'Mostrar: Solo Pendientes' : 'Mostrar: Todos'}
                    </button>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>ID</th>
                        <th>Cliente (Email)</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {data
                        .filter(v => {
                            const cumpleEstado = soloPendientes
                                ? (v.estado || 'pendiente').toLowerCase() === 'pendiente'
                                : true;

                            const termino = busqueda.toLowerCase();
                            const cumpleBusqueda =
                                (v.email || '').toLowerCase().includes(termino) ||
                                (v.id || '').toString().includes(termino);

                            return cumpleEstado && cumpleBusqueda;
                        })
                        .map(v => {
                            const estadoSeguro = v.estado ? v.estado.toLowerCase() : 'pendiente';
                            return (
                                <tr key={v.id}>
                                    <td>{v.id}</td>
                                    <td className="text-center">{v.email}</td>
                                    <td className="text-center">{new Date(v.fecha).toLocaleDateString()}</td>
                                    <td className="text-center text-bold">{v.total}€</td>
                                    <td className="text-center">
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            backgroundColor: estadoSeguro === 'pendiente' ? '#fef3c7' : '#dcfce7',
                                            color: estadoSeguro === 'pendiente' ? '#92400e' : '#166534'
                                        }}>
                                            {v.estado || 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        {estadoSeguro === 'pendiente' ? (
                                            <button
                                                onClick={() => {
                                                    const token = localStorage.getItem('token_fc_canaveral');
                                                    axios.put(`http://localhost:5000/api/admin/ventas/${v.id}`, { estado: 'Enviado' }, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    })
                                                        .then(() => {
                                                            alert("¡Pedido marcado como enviado!");
                                                            cargarDatos();
                                                        });
                                                }}
                                                className="btn-ok"
                                            >
                                                Marcar como Enviado
                                            </button>
                                        ) : (
                                            <span className="text-muted text-small">Completado</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    ) : (
        <p style={{ textAlign: 'center', padding: '20px' }}>No hay ventas registradas o cargando...</p>
    );
}

export default VentasTab;
