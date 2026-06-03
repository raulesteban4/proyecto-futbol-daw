import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './tabs.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

function VentasTab({ data, setData, stats }) {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [busqueda, setBusqueda] = useState('');
    const [soloPendientes, setSoloPendientes] = useState(false);
    const [ventasPorDia, setVentasPorDia] = useState([]);
    const [productosTop, setProductosTop] = useState([]);

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get(`${API}/api/admin/ventas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar ventas:", err));
    };

    useEffect(() => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get(`${API}/api/admin/stats/ventas-por-dia`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => setVentasPorDia(res.data)).catch(() => {});

        axios.get(`${API}/api/admin/stats/productos-mas-vendidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => setProductosTop(res.data)).catch(() => {});
    }, []);

    const chartVentas = {
        labels: ventasPorDia.map(d => new Date(d.dia).toLocaleDateString().slice(0, 5)),
        datasets: [{
            label: 'Ventas (€)',
            data: ventasPorDia.map(d => Number(d.total)),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
        }]
    };

    const chartProductos = {
        labels: productosTop.map(p => p.nombre),
        datasets: [{
            data: productosTop.map(p => Number(p.total_vendido)),
            backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'],
        }]
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

    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                marginBottom: '30px'
            }}>
                <div style={cardStatStyle('#eff6ff', '#1e40af')}>
                    <span style={{ fontSize: '0.85rem' }}>Recaudación Total</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.totalRecaudado || 0}€</h2>
                </div>
                <div style={cardStatStyle('#fff7ed', '#9a3412')}>
                    <span style={{ fontSize: '0.85rem' }}>Producto Estrella</span>
                    <h2 style={{ margin: '5px 0', fontSize: '1.1rem' }}>{stats.productoEstrella || '---'}</h2>
                </div>
                <div style={cardStatStyle('#fef2f2', '#991b1b')}>
                    <span style={{ fontSize: '0.85rem' }}>Stock Bajo</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.stockBajo || 0} producto</h2>
                </div>
                <div style={cardStatStyle('#f0fdf4', '#15803d')}>
                    <span style={{ fontSize: '0.85rem' }}>Enviados</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.pedidosEnviados || 0}</h2>
                </div>
                <div style={cardStatStyle('#fffbeb', '#b45309')}>
                    <span style={{ fontSize: '0.85rem' }}>Pendientes</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.pedidosPendientes || 0}</h2>
                </div>
                <div style={cardStatStyle('#f8fafc', '#475569')}>
                    <span style={{ fontSize: '0.85rem' }}>Total Histórico</span>
                    <h2 style={{ margin: '5px 0' }}>{stats.totalPedidos || 0}</h2>
                </div>
            </div>

            {ventasPorDia.length > 0 && (
                <div style={{ marginBottom: 30 }}>
                    <h3>Ventas por Día (últimos 30 días)</h3>
                    <div style={{ maxHeight: 250 }}>
                        <Bar
                            data={chartVentas}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                            }}
                        />
                    </div>
                </div>
            )}

            {productosTop.length > 0 && (
                <div style={{ marginBottom: 30, display: 'flex', gap: 30, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <h3>Productos Más Vendidos</h3>
                        <div style={{ maxHeight: 300, maxWidth: 400 }}>
                            <Doughnut
                                data={chartProductos}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: { font: { size: 11 } }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: '1 1 300px' }}>
                        <h3>Top Productos</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Vendidos</th>
                                    <th>Ingresos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosTop.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.nombre}</td>
                                        <td className="text-center">{p.total_vendido}</td>
                                        <td className="text-center">{Number(p.ingresos).toFixed(2)}€</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {data && data.length > 0 && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
                        <h3>Detalle de Transacciones</h3>
                        <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
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
                                                            axios.put(`${API}/api/admin/ventas/${v.id}`, { estado: 'enviado' }, {
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
                </>
            )}
            {(!data || data.length === 0) && (
                <p style={{ textAlign: 'center', padding: '20px' }}>No hay ventas registradas o cargando...</p>
            )}
        </div>
    );
}

export default VentasTab;
