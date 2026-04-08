import { useEffect, useState } from 'react';
import axios from 'axios';

function Competicion() {
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([]);

    useEffect(() => {
        // Cargar partidos y clasificación al entrar
        axios.get('http://localhost:5000/api/partidos').then(res => setPartidos(res.data));
        axios.get('http://localhost:5000/api/clasificacion').then(res => setClasificacion(res.data));
    }, []);

    return (
        <div style={{ display: 'flex', gap: '30px', padding: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* SECCIÓN CALENDARIO */}
            <div style={{ flex: '1', minWidth: '400px' }}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '3px solid #1e3a8a' }}>Próximos Partidos</h2>
                {partidos.map(m => (
                    <div key={m.id} style={{ backgroundColor: 'white', padding: '15px', marginBottom: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '12px', color: '#666' }}>{new Date(m.fecha).toLocaleDateString()}</span>
                            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>FC Cañaveral vs {m.rival}</div>
                            <span style={{ fontSize: '14px', color: '#1e3a8a' }}>📍 {m.ubicacion}</span>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: 'white', padding: '5px 15px', borderRadius: '5px' }}>
                            {m.jugado ? `${m.goles_local} - ${m.goles_visitante}` : 'VS'}
                        </div>
                    </div>
                ))}
            </div>

            {/* SECCIÓN CLASIFICACIÓN */}
            <div style={{ width: '350px' }}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '3px solid #1e3a8a' }}>Clasificación</h2>
                <table style={{ width: '100%', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                            <th style={{ padding: '10px' }}>Pos</th>
                            <th style={{ textAlign: 'left' }}>Equipo</th>
                            <th>PJ</th>
                            <th>Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clasificacion.map(e => (
                            <tr key={e.id} style={{ borderBottom: '1px solid #eee', backgroundColor: e.equipo === 'FC Cañaveral' ? '#eff6ff' : 'transparent' }}>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{e.posicion}</td>
                                <td style={{ padding: '10px' }}>{e.equipo === 'FC Cañaveral' ? '⭐ ' + e.equipo : e.equipo}</td>
                                <td style={{ textAlign: 'center' }}>{e.pj}</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{e.puntos}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Competicion;