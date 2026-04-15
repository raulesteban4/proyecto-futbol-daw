import { useEffect, useState } from 'react';
import axios from 'axios';
import './Plantilla.css';

function Plantilla() {
    const [jugadores, setJugadores] = useState([]);

    useEffect(() => {
        // Obtenemos solo los jugadores del FC Cañaveral (team_id = 1)
        axios.get('http://localhost:5000/api/jugadores')
            .then(res => {
                // Si tu API trae a todos, filtramos aquí por team_id 1
                const misJugadores = res.data.filter(p => p.team_id === 1);
                setJugadores(misJugadores);
            });
    }, []);

    // Función para agrupar por posición
    const renderSeccion = (titulo, pos) => {
        const filtrados = jugadores.filter(j => j.posicion.toLowerCase().includes(pos));
        if (filtrados.length === 0) return null;

        return (
            <div className="squad-section">
                <h2 className="section-title">{titulo}</h2>
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

    return (
        <div className="squad-container">
            <header className="squad-header">
                <h1>Plantilla Oficial</h1>
                <p>FC Cañaveral | Temporada 2025/26</p>
            </header>

            {renderSeccion("Porteros", "portero")}
            {renderSeccion("Defensas", "defensa")}
            {renderSeccion("Centrocampistas", "centrocampista")}
            {renderSeccion("Delanteros", "delantero")}
        </div>
    );
}

export default Plantilla;