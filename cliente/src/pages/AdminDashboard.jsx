import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [tab, setTab] = useState('jugadores'); // Controla qué pestaña vemos
    const [data, setData] = useState([]);

    // Cargar datos según la pestaña activa
    const cargarDatos = () => {
        let url = '';
        if (tab === 'jugadores') url = 'http://localhost:5000/api/jugadores';
        if (tab === 'partidos') url = 'http://localhost:5000/api/partidos';
        if (tab === 'clasificacion') url = 'http://localhost:5000/api/clasificacion';
        if (tab === 'tienda') url = 'http://localhost:5000/api/productos';

        axios.get(url).then(res => setData(res.data));
    };

    useEffect(() => { cargarDatos(); }, [tab]);

    // Función para actualizar resultado de partido
    const guardarResultado = (id, gL, gV) => {
        axios.put(`http://localhost:5000/api/admin/partidos/${id}`, {
            goles_local: gL,
            goles_visitante: gV,
            jugado: true
        }).then(() => {
            alert("Resultado guardado");
            cargarDatos();
        });
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#1e3a8a' }}>Panel de Control - FC Cañaveral</h1>
            
            {/* MENÚ DE PESTAÑAS */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setTab('jugadores')} style={btnStyle(tab === 'jugadores')}>Plantilla</button>
                <button onClick={() => setTab('partidos')} style={btnStyle(tab === 'partidos')}>Partidos</button>
                <button onClick={() => setTab('clasificacion')} style={btnStyle(tab === 'clasificacion')}>Clasificación</button>
                <button onClick={() => setTab('tienda')} style={btnStyle(tab === 'tienda')}>Tienda</button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {/* CONTENIDO SEGÚN PESTAÑA */}
                {tab === 'partidos' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Rival</th>
                                <th>Goles Local</th>
                                <th>Goles Visitante</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{m.rival}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input type="number" defaultValue={m.goles_local} id={`gl-${m.id}`} style={{ width: '50px' }} />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input type="number" defaultValue={m.goles_visitante} id={`gv-${m.id}`} style={{ width: '50px' }} />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => {
                                            const gL = document.getElementById(`gl-${m.id}`).value;
                                            const gV = document.getElementById(`gv-${m.id}`).value;
                                            guardarResultado(m.id, gL, gV);
                                        }} style={{ backgroundColor: '#1e3a8a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            Actualizar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {tab === 'jugadores' && <p>Aquí puedes reutilizar el formulario de añadir/borrar jugadores que hicimos antes.</p>}
                {tab === 'tienda' && <p>Aquí pondremos el formulario para añadir nuevos productos (camisetas, bufandas...).</p>}
                {tab === 'clasificacion' && <p>Aquí podrás editar los puntos de la liga.</p>}
            </div>
        </div>
    );
}

// Estilo sencillo para botones de pestañas
const btnStyle = (active) => ({
    padding: '10px 20px',
    backgroundColor: active ? '#1e3a8a' : '#e5e7eb',
    color: active ? 'white' : '#374151',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
});

export default AdminDashboard;