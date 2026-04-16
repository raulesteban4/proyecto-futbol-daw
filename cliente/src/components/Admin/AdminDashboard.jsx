import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import PlantillaTab from './Tabs/PlantillaTab';
import PartidosTab from './Tabs/PartidosTab';
import ClasificacionTab from './Tabs/ClasificacionTab';
import TiendaTab from './Tabs/TiendaTab';
import VentasTab from './Tabs/VentasTab';

function AdminDashboard() {
    const [tab, setTab] = useState('jugadores');
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ 
        totalRecaudado: 0, 
        totalPedidos: 0, 
        productoEstrella: 'N/A',
        stockBajo: 0,
        pedidosEnviados: 0,
        pedidosPendientes: 0
    });

    // Cargar datos según la pestaña activa
    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        let url = '';
        
        if (tab === 'jugadores') url = 'http://localhost:5000/api/jugadores';
        if (tab === 'partidos') url = 'http://localhost:5000/api/partidos';
        if (tab === 'clasificacion') url = 'http://localhost:5000/api/clasificacion';
        if (tab === 'tienda') url = 'http://localhost:5000/api/productos';
        if (tab === 'ventas') url = 'http://localhost:5000/api/admin/ventas';

        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
                console.error("Error al cargar datos:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    alert("Tu sesión ha caducado o no tienes permisos de administrador.");
                }
            });
    };

    const cargarStats = () => {
        const token = localStorage.getItem('token_fc_canaveral');

        axios.get('http://localhost:5000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => setStats(res.data))
            .catch(err => console.error("Error cargando stats:", err));
    };

    useEffect(() => {
        setData([]);
        cargarDatos();
        if (tab === 'ventas') {
            cargarStats();
        }
    }, [tab]);

    return (
        <div className="admin-container">
            <h1 className="admin-title">Panel de Control - FC Cañaveral</h1>

            {/* MENÚ DE PESTAÑAS */}
            <div className="admin-tabs">
                <button onClick={() => setTab('jugadores')} className={`admin-tab-button ${tab === 'jugadores' ? 'active' : ''}`}>Plantilla</button>
                <button onClick={() => setTab('partidos')} className={`admin-tab-button ${tab === 'partidos' ? 'active' : ''}`}>Partidos</button>
                <button onClick={() => setTab('clasificacion')} className={`admin-tab-button ${tab === 'clasificacion' ? 'active' : ''}`}>Clasificación</button>
                <button onClick={() => setTab('tienda')} className={`admin-tab-button ${tab === 'tienda' ? 'active' : ''}`}>Tienda</button>
                <button onClick={() => setTab('ventas')} className={`admin-tab-button ${tab === 'ventas' ? 'active' : ''}`}>Ventas</button>
            </div>

            <div className="admin-content">
                {/* CONTENIDO SEGÚN PESTAÑA */}
                {tab === 'jugadores' && <PlantillaTab data={data} setData={setData} />}
                {tab === 'partidos' && <PartidosTab data={data} setData={setData} />}
                {tab === 'clasificacion' && <ClasificacionTab data={data} setData={setData} />}
                {tab === 'tienda' && <TiendaTab data={data} setData={setData} />}
                {tab === 'ventas' && <VentasTab data={data} setData={setData} stats={stats} />}
            </div>
        </div>
    );
}

export default AdminDashboard;
