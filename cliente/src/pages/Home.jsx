import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Crearemos este archivo CSS

function Home() {
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([]);
    const [productos, setProductos] = useState([]);
    const [jugadores, setJugadores] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Cargar datos al montar el componente
        const cargarDatos = async () => {
            try {
                const [partidosRes, clasifRes, prodRes, jugRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/partidos'),
                    axios.get('http://localhost:5000/api/clasificacion'),
                    axios.get('http://localhost:5000/api/productos'),
                    axios.get('http://localhost:5000/api/jugadores')
                ]);

                setPartidos(partidosRes.data.slice(0, 3)); // Solo los próximos 3 partidos
                setClasificacion(clasifRes.data.slice(0, 5)); // Top 5 de la clasificación
                setProductos(prodRes.data.slice(0, 4)); // 4 productos destacados
                setJugadores(jugRes.data.slice(0, 6)); // 6 jugadores destacados
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };

        cargarDatos();
    }, []);

    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">¡Bienvenido al FC Cañaveral!</h1>
                    <p className="hero-subtitle">El club de fútbol que une a la comunidad</p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate('/competicion')} className="btn-primary">
                            Ver Competición
                        </button>
                        <button onClick={() => navigate('/tienda')} className="btn-secondary">
                            Tienda Oficial
                        </button>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://www.paradas.es/export/sites/paradas/.galleries/imagenes-noticias-test/futbol_1576149772602.jpg" alt="FC Cañaveral" />
                </div>
            </section>

            {/* PRÓXIMOS PARTIDOS */}
            <section className="section partidos-section">
                <h2 className="section-title">Próximos Partidos</h2>
                <div className="partidos-grid">
                    {partidos.length > 0 ? partidos.map(m => (
                        <div key={m.id} className="partido-card">
                            <div className="partido-fecha">{new Date(m.fecha).toLocaleDateString()}</div>
                            <div className="partido-rival">
                                <span className="equipo-local">FC Cañaveral</span>
                                <span className="vs">VS</span>
                                <span className="equipo-visitante">{m.rival}</span>
                            </div>
                            <div className="partido-ubicacion">📍 {m.ubicacion}</div>
                            {m.jugado && (
                                <div className="partido-resultado">
                                    {m.goles_local} - {m.goles_visitante}
                                </div>
                            )}
                        </div>
                    )) : (
                        <p>Cargando partidos...</p>
                    )}
                </div>
                <button onClick={() => navigate('/competicion')} className="btn-ver-mas">
                    Ver Todos los Partidos
                </button>
            </section>

            {/* CLASIFICACIÓN */}
            <section className="section clasificacion-section">
                <h2 className="section-title">Clasificación</h2>
                <div className="clasificacion-table">
                    <div className="table-header">
                        <span>Pos</span>
                        <span>Equipo</span>
                        <span>PJ</span>
                        <span>Pts</span>
                    </div>
                    {clasificacion.map(e => (
                        <div key={e.id} className={`table-row ${e.equipo === 'FC Cañaveral' ? 'destacado' : ''}`}>
                            <span>{e.posicion}</span>
                            <span>{e.equipo === 'FC Cañaveral' ? '⭐ ' + e.equipo : e.equipo}</span>
                            <span>{e.pj}</span>
                            <span>{e.puntos}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* JUGADORES DESTACADOS */}
            <section className="section jugadores-section">
                <h2 className="section-title">Nuestra Plantilla</h2>
                <div className="jugadores-grid">
                    {jugadores.map(j => (
                        <div key={j.id} className="jugador-card">
                            <div className="dorsal">{j.dorsal}</div>
                            <h3>{j.nombre}</h3>
                            <p>{j.posicion}</p>
                            <div className="stats">
                                <span>Goles: {j.goles || 0}</span>
                                <span>Asist: {j.asistencias || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate('/plantilla')} className="btn-ver-mas">
                    Ver Toda la Plantilla
                </button>
            </section>

            {/* TIENDA DESTACADA */}
            <section className="section tienda-section">
                <h2 className="section-title">Tienda Oficial</h2>
                <div className="productos-grid">
                    {productos.map(p => (
                        <div key={p.id} className="producto-card">
                            <img src={p.imagen_url || 'https://via.placeholder.com/200'} alt={p.nombre} />
                            <div className="producto-info">
                                <span className="categoria">{p.categoria}</span>
                                <h3>{p.nombre}</h3>
                                <p className="precio">{p.precio}€</p>
                                <p className="stock">Stock: {p.stock}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate('/tienda')} className="btn-ver-mas">
                    Ver Toda la Tienda
                </button>
            </section>

            {/* ESTADÍSTICAS RÁPIDAS */}
            <section className="section stats-section">
                <h2 className="section-title">Estadísticas del Club</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{jugadores.length}</h3>
                        <p>Jugadores</p>
                    </div>
                    <div className="stat-card">
                        <h3>{partidos.filter(p => p.jugado).length}</h3>
                        <p>Partidos Jugados</p>
                    </div>
                    <div className="stat-card">
                        <h3>{productos.length}</h3>
                        <p>Productos</p>
                    </div>
                    <div className="stat-card">
                        <h3>{clasificacion.find(c => c.equipo === 'FC Cañaveral')?.posicion || 'N/A'}</h3>
                        <p>Posición en Liga</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;