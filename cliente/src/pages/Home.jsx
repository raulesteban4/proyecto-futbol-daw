import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Home() {
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([]);
    const [productos, setProductos] = useState([]);
    const [jugadores, setJugadores] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [partidosRes, clasifRes, prodRes, jugRes] = await Promise.all([
                    axios.get(`${API}/api/partidos`),
                    axios.get(`${API}/api/clasificacion`),
                    axios.get(`${API}/api/productos`),
                    axios.get(`${API}/api/jugadores`)
                ]);

                setPartidos(partidosRes.data.slice(0, 3));
                setClasificacion(clasifRes.data.slice(0, 5));
                setProductos(prodRes.data.slice(0, 4));
                setJugadores(jugRes.data.slice(0, 6));
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };

        cargarDatos();
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const proximosPartidos = partidos.filter(p => !p.jugado);
    const resultadosRecientes = partidos.filter(p => p.jugado).reverse().slice(0, 3);

    if (loading) {
        return (
            <div className="home-loading">
                <div className="loader"></div>
                <p>Cargando FC Cañaveral...</p>
            </div>
        );
    }

    const canaveralInfo = clasificacion.find(c => c.equipo === 'FC Cañaveral');

    return (
        <div className="home">
            {/* HERO */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <span className="hero-badge">Temporada 2025/26</span>
                    <h1 className="hero-title">FC Cañaveral</h1>
                    <p className="hero-subtitle">Pasión, esfuerzo y comunidad. El club que nos une.</p>
                    <div className="hero-actions">
                        <button onClick={() => navigate('/competicion')} className="hero-btn hero-btn--primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                            Competición
                        </button>
                        <button onClick={() => navigate('/tienda')} className="hero-btn hero-btn--outline">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                            Tienda
                        </button>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat__value">{jugadores.length}</span>
                            <span className="hero-stat__label">Jugadores</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__value">{partidos.filter(p => p.jugado).length}</span>
                            <span className="hero-stat__label">Partidos</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__value">{canaveralInfo?.posicion || '-'}</span>
                            <span className="hero-stat__label">Posición</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__value">{canaveralInfo?.puntos || 0}</span>
                            <span className="hero-stat__label">Puntos</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEXT MATCH HIGHLIGHT */}
            {proximosPartidos.length > 0 && (
                <section className="next-match">
                    <div className="next-match__inner">
                        <span className="next-match__label">Próximo Partido</span>
                        <div className="next-match__teams">
                            <div className="next-match__team next-match__team--home">
                                <span className="next-match__team-name">FC Cañaveral</span>
                            </div>
                            <div className="next-match__vs">
                                <span className="next-match__date">{formatDate(proximosPartidos[0].fecha)}</span>
                                <span className="next-match__time">VS</span>
                            </div>
                            <div className="next-match__team next-match__team--away">
                                <span className="next-match__team-name">{proximosPartidos[0].rival}</span>
                            </div>
                        </div>
                        <span className="next-match__location">📍 {proximosPartidos[0].ubicacion}</span>
                        <button onClick={() => navigate('/competicion')} className="next-match__btn">
                            Ver Calendario
                        </button>
                    </div>
                </section>
            )}

            {/* MATCHES SECTION */}
            <section className="section section--matches">
                <div className="section__header">
                    <h2 className="section__title">Resultados Recientes</h2>
                    <button onClick={() => navigate('/competicion')} className="section__link">Ver todos →</button>
                </div>
                <div className="matches-list">
                    {resultadosRecientes.length > 0 ? resultadosRecientes.map(m => (
                        <div key={m.id} className="match-row">
                            <div className="match-row__info">
                                <span className="match-row__date">{formatDate(m.fecha)}</span>
                                <span className="match-row__location">📍 {m.ubicacion}</span>
                            </div>
                            <div className="match-row__teams">
                                <span className="match-row__team match-row__team--home">FC Cañaveral</span>
                                <span className="match-row__score">
                                    <span className={`match-row__score-num ${m.goles_local > m.goles_visitante ? 'win' : m.goles_local < m.goles_visitante ? 'lose' : ''}`}>
                                        {m.goles_local}
                                    </span>
                                    <span className="match-row__score-sep">-</span>
                                    <span className={`match-row__score-num ${m.goles_visitante > m.goles_local ? 'win' : m.goles_visitante < m.goles_local ? 'lose' : ''}`}>
                                        {m.goles_visitante}
                                    </span>
                                </span>
                                <span className="match-row__team match-row__team--away">{m.rival}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-state">No hay resultados disponibles</div>
                    )}
                </div>
            </section>

            {/* STANDINGS */}
            <section className="section section--standings">
                <div className="section__header">
                    <h2 className="section__title">Clasificación</h2>
                    <button onClick={() => navigate('/competicion')} className="section__link">Ver completa →</button>
                </div>
                <div className="standings-card">
                    <table className="standings-table">
                        <thead>
                            <tr>
                                <th className="standings-table__th standings-table__th--pos">#</th>
                                <th className="standings-table__th standings-table__th--team">Equipo</th>
                                <th className="standings-table__th standings-table__th--pj">PJ</th>
                                <th className="standings-table__th standings-table__th--pts">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clasificacion.map(e => (
                                <tr key={e.id} className={`standings-table__row ${e.equipo === 'FC Cañaveral' ? 'standings-table__row--highlight' : ''}`}>
                                    <td className="standings-table__td standings-table__td--pos">
                                        <span className={`pos-badge pos-badge--${e.posicion <= 1 ? 'gold' : e.posicion <= 3 ? 'silver' : 'default'}`}>
                                            {e.posicion}
                                        </span>
                                    </td>
                                    <td className="standings-table__td standings-table__td--team">
                                        {e.equipo === 'FC Cañaveral' && <span className="team-star">⭐</span>}
                                        {e.equipo}
                                    </td>
                                    <td className="standings-table__td standings-table__td--center">{e.pj}</td>
                                    <td className="standings-table__td standings-table__td--center standings-table__td--pts">
                                        <strong>{e.puntos}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* PLAYERS */}
            <section className="section section--players">
                <div className="section__header">
                    <h2 className="section__title">Plantilla Destacada</h2>
                    <button onClick={() => navigate('/plantilla')} className="section__link">Ver todos →</button>
                </div>
                <div className="players-grid">
                    {jugadores.map(j => (
                        <div key={j.id} className="player-card">
                            <div className="player-card__dorsal">{j.dorsal}</div>
                            <div className="player-card__body">
                                <h3 className="player-card__name">{j.nombre}</h3>
                                <span className="player-card__pos">{j.posicion}</span>
                            </div>
                            <div className="player-card__stats">
                                <div className="player-card__stat">
                                    <span className="player-card__stat-val">{j.goles || 0}</span>
                                    <span className="player-card__stat-label">Goles</span>
                                </div>
                                <div className="player-card__stat">
                                    <span className="player-card__stat-val">{j.asistencias || 0}</span>
                                    <span className="player-card__stat-label">Asist.</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* STORE */}
            <section className="section section--store">
                <div className="section__header">
                    <h2 className="section__title">Tienda Oficial</h2>
                    <button onClick={() => navigate('/tienda')} className="section__link">Ir a la tienda →</button>
                </div>
                <div className="store-grid">
                    {productos.map(p => (
                        <button key={p.id} className="store-card" onClick={() => navigate('/tienda')}>
                            <div className="store-card__img">
                                <img src={p.imagen_url || 'https://via.placeholder.com/300x200?text=FC+Cañaveral'} alt={p.nombre} />
                                {p.stock < 5 && <span className="store-card__badge store-card__badge--low">Quedan {p.stock}</span>}
                            </div>
                            <div className="store-card__info">
                                <span className="store-card__cat">{p.categoria}</span>
                                <h3 className="store-card__name">{p.nombre}</h3>
                                <div className="store-card__footer">
                                    <span className="store-card__price">{p.precio}€</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>¿Listo para ser parte del FC Cañaveral?</h2>
                    <p>Únete a nuestra comunidad, compra merchandising oficial y sigue cada partido de cerca.</p>
                    <div className="cta-actions">
                        <button onClick={() => navigate('/registro')} className="cta-btn cta-btn--primary">Crear Cuenta</button>
                        <button onClick={() => navigate('/login')} className="cta-btn cta-btn--outline">Iniciar Sesión</button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="home-footer">
                <div className="home-footer__inner">
                    <div className="home-footer__brand">
                        <strong>FC Cañaveral</strong>
                        <p>El club de fútbol que une a la comunidad</p>
                    </div>
                    <div className="home-footer__links">
                        <button onClick={() => navigate('/competicion')}>Competición</button>
                        <button onClick={() => navigate('/plantilla')}>Plantilla</button>
                        <button onClick={() => navigate('/tienda')}>Tienda</button>
                    </div>
                    <p className="home-footer__copy">© 2026 FC Cañaveral. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
