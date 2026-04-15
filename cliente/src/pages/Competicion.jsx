import { useEffect, useState } from 'react';
import axios from 'axios';

function Competicion() {
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/partidos').then(res => setPartidos(res.data));
        axios.get('http://localhost:5000/api/clasificacion').then(res => setClasificacion(res.data));
    }, []);

    // Separamos los partidos para mostrarlos en secciones distintas
    const partidosJugados = partidos.filter(m => m.jugado).reverse();
    const proximosPartidos = partidos.filter(m => m.jugado === 0 || !m.jugado);

    return (
        <div style={{ display: 'flex', gap: '40px', padding: '40px', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
            
            {/* SECCIÓN CALENDARIO */}
            <div style={{ flex: '1', maxWidth: '600px' }}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '3px solid #1e3a8a', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    Calendario
                </h2>

                {/* Próximos */}
                <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Siguientes Encuentros</h3>
                {proximosPartidos.map(m => (
                    <div key={m.id} style={cardStyle}>
                        <div style={{ flex: 1 }}>
                            <span style={dateStyle}>
                                {new Date(m.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(m.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
                            </span>
                            <div style={teamsStyle}>FC Cañaveral <span style={{color: '#94a3b8', fontWeight: 'normal'}}>vs</span> {m.rival}</div>
                            <span style={locationStyle}>📍 {m.ubicacion}</span>
                        </div>
                        <div style={vsBadgeStyle}>VS</div>
                    </div>
                ))}

                {/* Resultados Pasados */}
                <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '30px' }}>Resultados Recientes</h3>
                {partidosJugados.map(m => (
                    <div key={m.id} style={{ ...cardStyle, opacity: 0.9 }}>
                        <div style={{ flex: 1 }}>
                            <span style={dateStyle}>{new Date(m.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(m.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h</span>
                            <div style={teamsStyle}>FC Cañaveral vs {m.rival}</div>
                            <span style={locationStyle}>📍 {m.ubicacion}</span>
                        </div>
                        <div style={scoreBadgeStyle}>
                            {m.goles_local} - {m.goles_visitante}
                        </div>
                    </div>
                ))}
            </div>

            {/* SECCIÓN CLASIFICACIÓN */}
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '3px solid #1e3a8a', marginBottom: '20px' }}>Clasificación</h2>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                                <th style={{ padding: '15px 10px' }}>Pos</th>
                                <th style={{ textAlign: 'left' }}>Equipo</th>
                                <th>PJ</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clasificacion.map((e, index) => (
                                <tr key={e.id} style={{ 
                                    borderBottom: '1px solid #f1f5f9', 
                                    backgroundColor: e.equipo === 'FC Cañaveral' ? '#eff6ff' : 'white',
                                    fontWeight: e.equipo === 'FC Cañaveral' ? 'bold' : 'normal'
                                }}>
                                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                                        <span style={posStyle(index + 1)}>{e.posicion}</span>
                                    </td>
                                    <td style={{ padding: '12px 10px' }}>
                                        {e.equipo === 'FC Cañaveral' ? '⭐ ' + e.equipo : e.equipo}
                                    </td>
                                    <td style={{ textAlign: 'center', color: '#64748b' }}>{e.pj}</td>
                                    <td style={{ textAlign: 'center', fontSize: '1.1rem' }}>{e.puntos}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ESTILOS EN OBJETOS PARA LIMPIEZA
const cardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    marginBottom: '12px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: '5px solid #1e3a8a'
};

const dateStyle = {
    fontSize: '13px',
    color: '#64748b',
    display: 'block',
    marginBottom: '5px',
    textTransform: 'capitalize'
};

const teamsStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '5px'
};

const locationStyle = {
    fontSize: '13px',
    color: '#1e3a8a',
    fontWeight: '500'
};

const vsBadgeStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    color: '#1e3a8a',
    padding: '8px 15px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0'
};

const scoreBadgeStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#1e3a8a',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '8px',
    minWidth: '60px',
    textAlign: 'center'
};

const posStyle = (pos) => ({
    display: 'inline-block',
    width: '28px',
    height: '28px',
    lineHeight: '28px',
    borderRadius: '50%',
    backgroundColor: pos <= 3 ? '#fef3c7' : 'transparent',
    color: pos <= 3 ? '#92400e' : '#64748b',
    fontWeight: 'bold'
});

export default Competicion;