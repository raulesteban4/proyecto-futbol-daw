import { useEffect, useState } from 'react';
import axios from 'axios';
import './Competicion.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Competicion() {
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/api/partidos`),
            axios.get(`${API}/api/clasificacion`)
        ])
            .then(([resPartidos, resClas]) => {
                setPartidos(resPartidos.data);
                setClasificacion(resClas.data);
            })
            .finally(() => setCargando(false));
    }, []);

    const partidosJugados = partidos.filter(m => m.jugado).reverse();
    const proximosPartidos = partidos.filter(m => m.jugado === 0 || !m.jugado);

    if (cargando) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Cargando competición...</p>
            </div>
        );
    }

    return (
        <div className="competicion-container">
            <div className="competicion-col">
                <h2 className="section-heading">
                    Calendario
                </h2>

                <h3 className="sub-heading">Siguientes Encuentros</h3>
                {proximosPartidos.map(m => (
                    <div key={m.id} className="match-card">
                        <div className="match-info">
                            <span className="match-date">
                                {new Date(m.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(m.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h
                            </span>
                            <div className="match-teams">FC Cañaveral <span className="vs-text">vs</span> {m.rival}</div>
                            <span className="match-location">📍 {m.ubicacion}</span>
                        </div>
                        <div className="vs-badge">VS</div>
                    </div>
                ))}

                <h3 className="sub-heading">Resultados Recientes</h3>
                {partidosJugados.map(m => (
                    <div key={m.id} className="match-card played">
                        <div className="match-info">
                            <span className="match-date">{new Date(m.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(m.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}h</span>
                            <div className="match-teams">FC Cañaveral vs {m.rival}</div>
                            <span className="match-location">📍 {m.ubicacion}</span>
                        </div>
                        <div className="score-badge">
                            {m.goles_local} - {m.goles_visitante}
                        </div>
                    </div>
                ))}
            </div>

            <div className="ranking-col">
                <h2 className="section-heading">Clasificación</h2>
                <div className="ranking-table-wrapper">
                    <table className="ranking-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clasificacion.map((e, index) => (
                                <tr key={e.id} className={e.equipo === 'FC Cañaveral' ? 'highlight-row' : ''}>
                                    <td className="pos-cell">
                                        <span className={`pos-badge ${index < 3 ? 'top-pos' : ''}`}>{e.posicion}</span>
                                    </td>
                                    <td>{e.equipo === 'FC Cañaveral' ? '⭐ ' + e.equipo : e.equipo}</td>
                                    <td className="muted-cell">{e.pj}</td>
                                    <td className="pts-cell">{e.puntos}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Competicion;
