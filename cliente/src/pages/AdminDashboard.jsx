import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [tab, setTab] = useState('jugadores'); // Controla qué pestaña vemos
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ totalRecaudado: 0, totalPedidos: 0, productoEstrella: 'N/A' });
    const [busqueda, setBusqueda] = useState('');
    const [soloPendientes, setSoloPendientes] = useState(false);



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
                    navigate('/login');
                }
            });
    };

    const cargarStats = () => {
        const token = localStorage.getItem('token_fc_canaveral'); // 1. Recuperar token

        axios.get('http://localhost:5000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}` // 2. Enviarlo en el header
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

    // Función para actualizar resultado de partido
    const guardarResultado = (id, gL, gV) => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.put(`http://localhost:5000/api/admin/partidos/${id}`, {
            goles_local: gL,
            goles_visitante: gV,
            jugado: true
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(() => {
            alert("Resultado guardado");
            cargarDatos();
        });
    };

    // --- FUNCIONES DE TIENDA ---
    const actualizarProducto = (id) => {
        const token = localStorage.getItem('token_fc_canaveral');
        const actualizado = {
            nombre: document.getElementById(`prod-nom-${id}`).value,
            precio: document.getElementById(`prod-pre-${id}`).value,
            stock: document.getElementById(`prod-stk-${id}`).value,
            categoria: document.getElementById(`prod-cat-${id}`).value,
            descripcion: document.getElementById(`prod-desc-${id}`).value,
            imagen_url: document.getElementById(`prod-img-${id}`).value
        };

        axios.put(`http://localhost:5000/api/admin/productos/${id}`, actualizado, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Producto actualizado con éxito");
                cargarDatos();
            })
            .catch(err => alert("Error al actualizar"));
    };

    const eliminarProducto = (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
            const token = localStorage.getItem('token_fc_canaveral');
            axios.delete(`http://localhost:5000/api/admin/productos/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(() => {
                    alert("Producto eliminado");
                    cargarDatos();
                });
        }
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
                <button onClick={() => setTab('ventas')} style={btnStyle(tab === 'ventas')}>Ventas</button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {/* CONTENIDO SEGÚN PESTAÑA */}
                {tab === 'partidos' && (
                    <div>
                        {/* Formulario para añadir partido con Ubicación y Fecha completa */}
                        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '16px' }}>Programar Nuevo Partido</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const token = localStorage.getItem('token_fc_canaveral');
                                const nuevoP = {
                                    rival: e.target.rival.value,
                                    fecha: e.target.fecha.value,
                                    ubicacion: e.target.ubicacion.value,
                                    goles_local: 0,
                                    goles_visitante: 0,
                                    jugado: false
                                };
                                axios.post('http://localhost:5000/api/admin/partidos', nuevoP, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                }).then(() => {
                                    alert("Partido añadido correctamente");
                                    e.target.reset();
                                    cargarDatos();
                                }).catch(err => alert("Error al añadir partido"));
                            }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <input name="rival" placeholder="Rival" required style={{ ...inputStyle, flex: 1 }} />
                                <input name="ubicacion" placeholder="Campo / Ubicación" required style={{ ...inputStyle, flex: 1 }} />
                                <input name="fecha" type="datetime-local" required style={{ ...inputStyle, width: 'auto' }} />
                                <button type="submit" style={btnOkStyle}>+ Añadir</button>
                            </form>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Partido</th>
                                    <th>Fecha y Hora</th>
                                    <th>Ubicación</th>
                                    <th>Goles L/V</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>
                                            <input id={`riv-${m.id}`} defaultValue={m.rival} style={{ ...inputStyle, fontWeight: 'bold' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {/* Input para editar fecha y hora */}
                                            <input
                                                id={`fec-${m.id}`}
                                                type="datetime-local"
                                                defaultValue={m.fecha ? new Date(m.fecha).toISOString().slice(0, 16) : ''}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`ubi-${m.id}`} defaultValue={m.ubicacion} style={inputStyle} />
                                        </td>
                                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <input type="number" defaultValue={m.goles_local} id={`gl-${m.id}`} style={{ width: '40px', textAlign: 'center' }} />
                                            <span> - </span>
                                            <input type="number" defaultValue={m.goles_visitante} id={`gv-${m.id}`} style={{ width: '40px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => {
                                                const token = localStorage.getItem('token_fc_canaveral');
                                                const actualizado = {
                                                    rival: document.getElementById(`riv-${m.id}`).value,
                                                    fecha: document.getElementById(`fec-${m.id}`).value,
                                                    ubicacion: document.getElementById(`ubi-${m.id}`).value,
                                                    goles_local: document.getElementById(`gl-${m.id}`).value,
                                                    goles_visitante: document.getElementById(`gv-${m.id}`).value,
                                                    jugado: true
                                                };
                                                axios.put(`http://localhost:5000/api/admin/partidos/${m.id}`, actualizado, {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                }).then(() => {
                                                    alert("Partido actualizado");
                                                    cargarDatos();
                                                });
                                            }} style={btnOkStyle}>Guardar</button>

                                            <button onClick={() => {
                                                if (window.confirm("¿Eliminar partido?")) {
                                                    const token = localStorage.getItem('token_fc_canaveral');
                                                    axios.delete(`http://localhost:5000/api/admin/partidos/${m.id}`, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    }).then(() => cargarDatos());
                                                }
                                            }} style={{ ...btnDelStyle, marginLeft: '5px' }}>Borrar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'jugadores' && (
                    <div>
                        <h3>Fichar Nuevo Jugador</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const token = localStorage.getItem('token_fc_canaveral');
                            const nuevo = {
                                nombre: e.target.nombre.value,
                                posicion: e.target.posicion.value,
                                dorsal: e.target.dorsal.value,
                                team_id: 1
                            };

                            axios.post('http://localhost:5000/api/jugadores', nuevo, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            })
                                .then(() => {
                                    alert("¡Jugador fichado con éxito!");
                                    e.target.reset();
                                    cargarDatos(); // Recarga la tabla para ver al nuevo jugador
                                })
                                .catch((error) => {
                                    // Si el servidor devuelve un error (como el 400 de dorsal repetido)
                                    if (error.response && error.response.status === 400) {
                                        alert("Error: " + error.response.data.message);
                                    } else {
                                        alert("Ocurrió un error inesperado al fichar al jugador.");
                                    }
                                });
                        }} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input name="nombre" placeholder="Nombre" required style={inputStyle} />
                            <select
                                name="posicion"
                                required
                                style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}
                            >
                                <option value="" selected>Selecciona Posición</option>
                                <option value="Portero">Portero</option>
                                <option value="Defensa">Defensa</option>
                                <option value="Centrocampista">Centrocampista</option>
                                <option value="Delantero">Delantero</option>
                            </select>
                            <input name="dorsal" type="number" placeholder="Dorsal" required style={{ width: '80px', padding: '8px' }} />
                            <button type="submit" style={btnOkStyle}>Añadir</button>
                        </form>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f9fafb' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Jugador</th>
                                    <th>Dorsal</th>
                                    <th>Goles</th>
                                    <th>Asist.</th>
                                    <th>Amarillas/Rojas</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(j => (
                                    <tr key={j.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{j.nombre}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{j.posicion}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`dor-${j.id}`} defaultValue={j.dorsal} type="number" style={{ ...statInputStyle, fontWeight: 'bold', border: '1px solid #1e3a8a' }} />
                                        </td>
                                        {/* Inputs para estadísticas */}
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`gol-${j.id}`} defaultValue={j.goles} type="number" style={statInputStyle} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`ast-${j.id}`} defaultValue={j.asistencias} type="number" style={statInputStyle} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`am-${j.id}`} defaultValue={j.amarillas} type="number" style={{ ...statInputStyle, borderColor: '#fbbf24' }} title="Amarillas" />
                                            <input id={`rj-${j.id}`} defaultValue={j.rojas} type="number" style={{ ...statInputStyle, borderColor: '#ef4444' }} title="Rojas" />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => {
                                                const token = localStorage.getItem('token_fc_canaveral');
                                                const datosActualizados = {
                                                    dorsal: document.getElementById(`dor-${j.id}`).value, // Capturamos el nuevo dorsal
                                                    goles: document.getElementById(`gol-${j.id}`).value,
                                                    asistencias: document.getElementById(`ast-${j.id}`).value,
                                                    amarillas: document.getElementById(`am-${j.id}`).value,
                                                    rojas: document.getElementById(`rj-${j.id}`).value
                                                };
                                                axios.put(`http://localhost:5000/api/admin/jugadores/stats/${j.id}`, datosActualizados, {
                                                    headers: {
                                                        'Authorization': `Bearer ${token}`
                                                    }
                                                })
                                                    .then(() => {
                                                        alert("Datos y dorsal actualizados");
                                                        cargarDatos();
                                                    })
                                                    .catch((error) => {
                                                        if (error.response && error.response.status === 400) {
                                                            alert("Error: " + error.response.data.message);
                                                        } else {
                                                            alert("Error al actualizar el jugador");
                                                        }
                                                    });
                                            }} style={btnOkStyle}>Actualizar</button>
                                            <button onClick={() => {
                                                if (window.confirm("¿Dar de baja?")) {
                                                    const token = localStorage.getItem('token_fc_canaveral');
                                                    axios.delete(`http://localhost:5000/api/jugadores/${j.id}`, {
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`
                                                        }
                                                    }).then(() => cargarDatos());
                                                }
                                            }} style={{ ...btnDelStyle, marginLeft: '5px' }}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'clasificacion' && (
                    <div>
                        {/* Formulario para añadir nuevo equipo a la liga */}
                        <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '16px' }}>Añadir Equipo a la Liga</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const token = localStorage.getItem('token_fc_canaveral');
                                const nuevoE = {
                                    equipo: e.target.equipo.value,
                                    pj: e.target.pj.value || 0,
                                    puntos: e.target.puntos.value || 0,
                                    posicion: e.target.posicion.value || 0
                                };
                                axios.post('http://localhost:5000/api/admin/ranking', nuevoE, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                }).then(() => {
                                    alert("Equipo añadido correctamente");
                                    e.target.reset();
                                    cargarDatos();
                                }).catch(err => alert("Error al añadir equipo"));
                            }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <input name="equipo" placeholder="Nombre del Equipo" required style={{ ...inputStyle, flex: 2 }} />
                                <input name="pj" type="number" placeholder="PJ" style={{ ...inputStyle, flex: 0.5 }} />
                                <input name="puntos" type="number" placeholder="Pts" style={{ ...inputStyle, flex: 0.5 }} />
                                <input name="posicion" type="number" placeholder="Pos" style={{ ...inputStyle, flex: 0.5 }} />
                                <button type="submit" style={btnOkStyle}>+ Añadir</button>
                            </form>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Equipo</th>
                                    <th>PJ</th>
                                    <th>Pts</th>
                                    <th>Posición</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(e => (
                                    <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>
                                            {/* Input para poder editar el nombre del equipo */}
                                            <input id={`nom-e-${e.id}`} defaultValue={e.equipo} style={{ ...inputStyle, fontWeight: 'bold' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`pj-${e.id}`} type="number" defaultValue={e.pj} style={{ width: '50px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`pts-${e.id}`} type="number" defaultValue={e.puntos} style={{ width: '50px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`pos-${e.id}`} type="number" defaultValue={e.posicion} style={{ width: '50px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button onClick={() => {
                                                    const token = localStorage.getItem('token_fc_canaveral');
                                                    const actualizado = {
                                                        equipo: document.getElementById(`nom-e-${e.id}`).value,
                                                        pj: document.getElementById(`pj-${e.id}`).value,
                                                        puntos: document.getElementById(`pts-${e.id}`).value,
                                                        posicion: document.getElementById(`pos-${e.id}`).value
                                                    };
                                                    axios.put(`http://localhost:5000/api/admin/ranking/${e.id}`, actualizado, {
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    }).then(() => {
                                                        alert("Clasificación actualizada");
                                                        cargarDatos();
                                                    });
                                                }} style={btnOkStyle}>Guardar</button>

                                                <button onClick={() => {
                                                    if (window.confirm(`¿Seguro que quieres eliminar a ${e.equipo}?`)) {
                                                        const token = localStorage.getItem('token_fc_canaveral');
                                                        axios.delete(`http://localhost:5000/api/admin/ranking/${e.id}`, {
                                                            headers: { 'Authorization': `Bearer ${token}` }
                                                        }).then(() => {
                                                            cargarDatos();
                                                        });
                                                    }
                                                }} style={btnDelStyle}>Borrar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'tienda' && (
                    <div>
                        <h3>Añadir Nuevo Producto</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const token = localStorage.getItem('token_fc_canaveral');
                            const producto = {
                                nombre: e.target.nombre.value,
                                precio: e.target.precio.value,
                                stock: e.target.stock.value,
                                categoria: e.target.categoria.value,
                                descripcion: e.target.descripcion.value,
                                imagen_url: e.target.imagen.value || 'https://via.placeholder.com/150'
                            };
                            axios.post('http://localhost:5000/api/admin/productos', producto, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            }).then(() => {
                                alert("Producto añadido");
                                e.target.reset();
                                cargarDatos();
                            });
                        }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '40px' }}>
                            <input name="nombre" placeholder="Nombre" required style={inputStyle} />
                            <input name="precio" type="number" step="0.01" placeholder="Precio (€)" required style={inputStyle} />
                            <input name="stock" type="number" placeholder="Stock" required style={inputStyle} />
                            <input name="categoria" placeholder="Categoría" required style={inputStyle} />
                            <input name="imagen" placeholder="URL Imagen" style={inputStyle} />
                            <textarea name="descripcion" placeholder="Descripción" style={{ ...inputStyle, gridColumn: 'span 2' }} />
                            <button type="submit" style={{ ...btnOkStyle, gridColumn: 'span 2', padding: '12px' }}>PUBLICAR PRODUCTO</button>
                        </form>

                        <h3>Gestionar Inventario</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #eee' }}>
                                    <th>Imagen / Info</th>
                                    <th>Precio (€)</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>
                                            <input id={`prod-nom-${p.id}`} defaultValue={p.nombre} style={{ ...inputStyle, fontWeight: 'bold', marginBottom: '5px' }} />
                                            <input id={`prod-cat-${p.id}`} defaultValue={p.categoria} style={{ ...inputStyle, fontSize: '12px' }} />
                                            <input id={`prod-img-${p.id}`} defaultValue={p.imagen_url} style={{ ...inputStyle, fontSize: '10px', marginTop: '5px' }} placeholder="URL Imagen" />
                                            <textarea id={`prod-desc-${p.id}`} defaultValue={p.descripcion} style={{ ...inputStyle, fontSize: '12px', marginTop: '5px' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input id={`prod-pre-${p.id}`} type="number" step="0.01" defaultValue={p.precio} style={{ ...statInputStyle, width: '70px' }} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                id={`prod-stk-${p.id}`}
                                                type="number"
                                                defaultValue={p.stock}
                                                style={{
                                                    ...statInputStyle,
                                                    width: '60px',
                                                    fontWeight: 'bold',
                                                    // Si el stock es < 5, ponemos el texto en rojo y borde naranja
                                                    color: p.stock < 5 ? '#ef4444' : '#1e293b',
                                                    borderColor: p.stock < 5 ? '#f59e0b' : '#ddd'
                                                }}
                                            />
                                            {p.stock < 5 && <div style={{ fontSize: '10px', color: '#ef4444' }}>¡Reponer!</div>}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => actualizarProducto(p.id)} style={btnOkStyle}>Guardar</button>
                                            <button onClick={() => eliminarProducto(p.id)} style={{ ...btnDelStyle, marginLeft: '5px' }}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'ventas' && (
                    data && data.length > 0 ? (
                        <div>
                            {/* Grid de 6 tarjetas de estadísticas */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '15px',
                                marginBottom: '30px'
                            }}>
                                {/* 1. Recaudación */}
                                <div style={cardStatStyle('#eff6ff', '#1e40af')}>
                                    <span style={{ fontSize: '0.85rem' }}>Recaudación Total</span>
                                    <h2 style={{ margin: '5px 0' }}>{stats.totalRecaudado || 0}€</h2>
                                </div>

                                {/* 2. Producto Estrella */}
                                <div style={cardStatStyle('#fff7ed', '#9a3412')}>
                                    <span style={{ fontSize: '0.85rem' }}>Producto Estrella</span>
                                    <h2 style={{ margin: '5px 0', fontSize: '1.1rem' }}>{stats.productoEstrella || '---'}</h2>
                                </div>

                                {/* 3. Stock Crítico */}
                                <div style={cardStatStyle('#fef2f2', '#991b1b')}>
                                    <span style={{ fontSize: '0.85rem' }}>Stock Bajo</span>
                                    <h2 style={{ margin: '5px 0' }}>{stats.stockBajo || 0} producto</h2>
                                </div>

                                {/* 4. Enviados */}
                                <div style={cardStatStyle('#f0fdf4', '#15803d')}>
                                    <span style={{ fontSize: '0.85rem' }}>Enviados</span>
                                    <h2 style={{ margin: '5px 0' }}>{stats.pedidosEnviados || 0}</h2>
                                </div>

                                {/* 5. Pendientes */}
                                <div style={cardStatStyle('#fffbeb', '#b45309')}>
                                    <span style={{ fontSize: '0.85rem' }}>Pendientes</span>
                                    <h2 style={{ margin: '5px 0' }}>{stats.pedidosPendientes || 0}</h2>
                                </div>

                                {/* 6. Total de Pedidos */}
                                <div style={cardStatStyle('#f8fafc', '#475569')}>
                                    <span style={{ fontSize: '0.85rem' }}>Total Histórico</span>
                                    <h2 style={{ margin: '5px 0' }}>{stats.totalPedidos || 0}</h2>
                                </div>
                            </div>

                            {/*tabla de ventas */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
                                <h3>Detalle de Transacciones</h3>

                                <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                                    {/* BUSCADOR POR EMAIL O ID */}
                                    <input
                                        type="text"
                                        placeholder="Buscar por Email o ID..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            width: '250px'
                                        }}
                                    />

                                    <button
                                        onClick={() => setSoloPendientes(!soloPendientes)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: soloPendientes ? 'rgb(223, 185, 86)' : '#d2d8e3',
                                            color: soloPendientes ? 'white' : '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {soloPendientes ? 'Mostrar: Solo Pendientes' : 'Mostrar: Todos'}
                                    </button>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                                        <th>Cliente (Email)</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data
                                        .filter(v => {
                                            // Filtro 1: Solo pendientes (si está activo)
                                            const cumpleEstado = soloPendientes
                                                ? (v.estado || 'pendiente').toLowerCase() === 'pendiente'
                                                : true;

                                            // Filtro 2: Buscador por Email o ID
                                            const termino = busqueda.toLowerCase();
                                            const cumpleBusqueda =
                                                (v.email || '').toLowerCase().includes(termino) ||
                                                (v.id || '').toString().includes(termino);

                                            return cumpleEstado && cumpleBusqueda;
                                        })
                                        .map(v => {
                                            const estadoSeguro = v.estado ? v.estado.toLowerCase() : 'pendiente';
                                            return (
                                                <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}>#{v.id}</td>
                                                    <td style={{ textAlign: 'center' }}>{v.email}</td>
                                                    <td style={{ textAlign: 'center' }}>{new Date(v.fecha).toLocaleDateString()}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{v.total}€</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            backgroundColor: estadoSeguro === 'pendiente' ? '#fef3c7' : '#dcfce7',
                                                            color: estadoSeguro === 'pendiente' ? '#92400e' : '#166534'
                                                        }}>
                                                            {v.estado || 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {estadoSeguro === 'pendiente' ? (
                                                            <button
                                                                onClick={() => {
                                                                    const token = localStorage.getItem('token_fc_canaveral');
                                                                    axios.put(`http://localhost:5000/api/admin/ventas/${v.id}`, { estado: 'Enviado' }, {
                                                                        headers: {
                                                                            'Authorization': `Bearer ${token}`
                                                                        }
                                                                    })
                                                                        .then(() => {
                                                                            alert("¡Pedido marcado como enviado!");
                                                                            cargarDatos();
                                                                            cargarStats();
                                                                        });
                                                                }}
                                                                style={btnOkStyle}
                                                            >
                                                                Marcar como Enviado
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: '#666', fontSize: '12px' }}>Completado</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', padding: '20px' }}>No hay ventas registradas o cargando...</p>
                    )
                )}
            </div>
        </div >
    );
}

// Estilo sencillo
const btnStyle = (active) => ({
    padding: '10px 20px',
    backgroundColor: active ? '#1e3a8a' : '#e5e7eb',
    color: active ? 'white' : '#374151',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
});

const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box'
};

const btnOkStyle = {
    backgroundColor: '#22c55e',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const btnDelStyle = {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer'
};
const statInputStyle = {
    width: '45px',
    padding: '4px',
    textAlign: 'center',
    borderRadius: '4px',
    border: '1px solid #ddd',
    margin: '0 2px'
};

const cardStatStyle = (bgColor, textColor) => ({
    backgroundColor: bgColor,
    color: textColor,
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
    border: `1px solid ${textColor}20`
});


export default AdminDashboard;