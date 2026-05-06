import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import escudo from '../assets/FC CAÑAVERAL escudo.avif';
import './Home.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Home() {
    const [partidos, setPartidos] = useState([]);
    const [clasificacion, setClasificacion] = useState([]);
    const [productos, setProductos] = useState([]);
    const [jugadores, setJugadores] = useState([]);
    const [totalJugadores, setTotalJugadores] = useState(0);
    const [loading, setLoading] = useState(true);
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

                const allJugadores = jugRes.data.filter(j => j.team_id === 1);
                setJugadores(
                    allJugadores
                        .sort((a, b) => ((b.goles || 0) + (b.asistencias || 0)) - ((a.goles || 0) + (a.asistencias || 0)))
                        .slice(0, 6)
                );
                setPartidos(partidosRes.data);
                setClasificacion(clasifRes.data);
                setProductos(prodRes.data.filter(p => p.stock > 0));

                setTotalJugadores(allJugadores.length);
            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
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
    const partidosJugados = partidos.filter(p => p.jugado).length;
    const victorias = partidos.filter(p => p.jugado && p.goles_local > p.goles_visitante).length;

    return (
        <div className="home">
            {/* HERO */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="hero-pattern"></div>
                <div className="hero-content">
                    <div className="hero-escudo">
                        <img src={escudo} alt="FC Cañaveral" />
                    </div>
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

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat__value">{totalJugadores}</span>
                            <span className="hero-stat__label">Jugadores</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__value">{partidosJugados}</span>
                            <span className="hero-stat__label">Jugados</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__value">{victorias}</span>
                            <span className="hero-stat__label">Victorias</span>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__value">{canaveralInfo?.puntos || 0}</span>
                            <span className="hero-stat__label">Puntos</span>
                        </div>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg-body)" />
                    </svg>
                </div>
            </section>

            {/* NEXT MATCH */}
            {proximosPartidos.length > 0 && (
                <section className="next-match">
                    <div className="next-match__inner">
                        <span className="next-match__label">
                            <span className="pulse-dot"></span>
                            Próximo Partido
                        </span>
                        <div className="next-match__teams">
                            <div className="next-match__team next-match__team--home">
                                <span className="next-match__team-name">FC Cañaveral</span>
                            </div>
                            <div className="next-match__vs">
                                <span className="next-match__date">{formatDate(proximosPartidos[0].fecha)}</span>
                                <span className="next-match__badge">VS</span>
                            </div>
                            <div className="next-match__team next-match__team--away">
                                <span className="next-match__team-name">{proximosPartidos[0].rival}</span>
                            </div>
                        </div>
                        <span className="next-match__location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {proximosPartidos[0].ubicacion}
                        </span>
                        <button onClick={() => navigate('/competicion')} className="next-match__btn">
                            Ver Calendario
                        </button>
                    </div>
                </section>
            )}

            {/* RESULTS */}
            <section className="section section--matches">
                <div className="section__header">
                    <h2 className="section__title">
                        <span className="section__icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                        </span>
                        Resultados Recientes
                    </h2>
                    <button onClick={() => navigate('/competicion')} className="section__link">Ver todos →</button>
                </div>
                <div className="matches-list">
                    {resultadosRecientes.length > 0 ? resultadosRecientes.map(m => {
                        const resultado = m.goles_local > m.goles_visitante ? 'W' : m.goles_local < m.goles_visitante ? 'L' : 'D';
                        return (
                            <div key={m.id} className="match-row">
                                <div className={`match-row__indicator match-row__indicator--${resultado}`}>{resultado}</div>
                                <div className="match-row__content">
                                    <div className="match-row__meta">
                                        <span className="match-row__date">{formatDate(m.fecha)}</span>
                                        <span className="match-row__location">{m.ubicacion}</span>
                                    </div>
                                    <div className="match-row__teams">
                                        <span className="match-row__team match-row__team--home">FC Cañaveral</span>
                                        <span className="match-row__score">
                                            <span className={`match-row__score-num ${m.goles_local > m.goles_visitante ? 'win' : m.goles_local < m.goles_visitante ? 'lose' : ''}`}>
                                                {m.goles_local}
                                            </span>
                                            <span className="match-row__score-sep">:</span>
                                            <span className={`match-row__score-num ${m.goles_visitante > m.goles_local ? 'win' : m.goles_visitante < m.goles_local ? 'lose' : ''}`}>
                                                {m.goles_visitante}
                                            </span>
                                        </span>
                                        <span className="match-row__team match-row__team--away">{m.rival}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="empty-state">No hay resultados disponibles</div>
                    )}
                </div>
            </section>

            {/* STANDINGS */}
            <section className="section section--standings">
                <div className="section__header">
                    <h2 className="section__title">
                        <span className="section__icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>
                        </span>
                        Clasificación
                    </h2>
                    <button onClick={() => navigate('/competicion')} className="section__link">Ver completa →</button>
                </div>
                <div className="standings-card">
                    <table className="standings-table">
                        <thead>
                            <tr>
                                <th className="standings-table__th standings-table__th--pos">#</th>
                                <th className="standings-table__th">Equipo</th>
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
                    <h2 className="section__title">
                        <span className="section__icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                        </span>
                        Plantilla Destacada
                    </h2>
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
                    <h2 className="section__title">
                        <span className="section__icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                        </span>
                        Tienda Oficial
                    </h2>
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
        </div>
    );
}

export default Home;
