import { useEffect, useState } from 'react';
import axios from 'axios';
import './Plantilla.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Plantilla() {
    const [jugadores, setJugadores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        axios.get(`${API}/api/jugadores`)
            .then(res => {
                const misJugadores = res.data
                    .filter(p => p.team_id === 1)
                    .sort((a, b) => (a.dorsal || 0) - (b.dorsal || 0));
                setJugadores(misJugadores);
            })
            .finally(() => setCargando(false));
    }, []);

    const jugadoresFiltrados = busqueda.trim()
        ? jugadores.filter(j =>
            j.nombre.toLowerCase().includes(busqueda.toLowerCase().trim())
        )
        : jugadores;

    const renderSeccion = (titulo, pos) => {
        const filtrados = jugadoresFiltrados.filter(j => j.posicion.toLowerCase().includes(pos));
        if (filtrados.length === 0) return null;

        return (
            <div className="squad-section">
                <h2 className="section-title">{titulo} ({filtrados.length})</h2>
                <div className="players-grid">
                    {filtrados.map(j => (
                        <div key={j.id} className="player-card">
                            <div className="player-number">{j.dorsal}</div>
                            <div className="player-info">
                                <h3 className="player-name">{j.nombre}</h3>
                                <p className="player-pos">{j.posicion}</p>
                            </div>
                            <div className="player-stats">
                                <div className="stat-item">
                                    <span className="stat-value">{j.goles}</span>
                                    <span className="stat-label">Goles</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{j.asistencias}</span>
                                    <span className="stat-label">Asist.</span>
                                </div>
                                <div className="stat-item card-stat">
                                    <span className="stat-value yellow">{j.amarillas}</span>
                                    <span className="stat-value red">{j.rojas}</span>
                                    <span className="stat-label">Tarjetas</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const totalVisible = jugadoresFiltrados.length;

    if (cargando) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Cargando plantilla...</p>
            </div>
        );
    }

    return (
        <div className="squad-container">
            <header className="squad-header">
                <h1>Plantilla Oficial</h1>
                <p>FC Cañaveral | Temporada 2025/26</p>
            </header>

            <div className="squad-search">
                <label htmlFor="busqueda-jugador" className="squad-search__label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        id="busqueda-jugador"
                        type="search"
                        className="squad-search__input"
                        placeholder="Buscar jugador..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </label>
                {busqueda && (
                    <button
                        className="squad-search__clear"
                        onClick={() => setBusqueda('')}
                        aria-label="Limpiar búsqueda"
                    >
                        ✕
                    </button>
                )}
            </div>

            {jugadores.length > 0 && totalVisible === 0 && busqueda.trim()
                ? <p className="squad-no-results">No se encontró ningún jugador con ese nombre.</p>
                : <>
                    {renderSeccion("Porteros", "portero")}
                    {renderSeccion("Defensas", "defensa")}
                    {renderSeccion("Centrocampistas", "centrocampista")}
                    {renderSeccion("Delanteros", "delantero")}
                  </>
            }
        </div>
    );
}

export default Plantilla;
