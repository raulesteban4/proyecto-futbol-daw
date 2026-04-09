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
        if (tab === 'ventas') url = 'http://localhost:5000/api/admin/ventas';

        axios.get(url).then(res => setData(res.data));
    };

    useEffect(() => {
        setData([]); // Limpiamos datos viejos antes de cargar los nuevos
        cargarDatos();
    }, [tab]);

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
                <button onClick={() => setTab('ventas')} style={btnStyle(tab === 'ventas')}>Ventas</button>
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

                {tab === 'jugadores' && (
                    <div>
                        <h3>Fichar Nuevo Jugador</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const nuevo = {
                                nombre: e.target.nombre.value,
                                posicion: e.target.posicion.value,
                                dorsal: e.target.dorsal.value,
                                team_id: 1
                            };

                            axios.post('http://localhost:5000/api/jugadores', nuevo)
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
                                                const datosActualizados = {
                                                    dorsal: document.getElementById(`dor-${j.id}`).value, // Capturamos el nuevo dorsal
                                                    goles: document.getElementById(`gol-${j.id}`).value,
                                                    asistencias: document.getElementById(`ast-${j.id}`).value,
                                                    amarillas: document.getElementById(`am-${j.id}`).value,
                                                    rojas: document.getElementById(`rj-${j.id}`).value
                                                };
                                                axios.put(`http://localhost:5000/api/admin/jugadores/stats/${j.id}`, datosActualizados)
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
                                                    axios.delete(`http://localhost:5000/api/jugadores/${j.id}`).then(() => cargarDatos());
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
                                    <td style={{ padding: '10px' }}>{e.equipo}</td>
                                    <td style={{ textAlign: 'center' }}><input id={`pj-${e.id}`} defaultValue={e.pj} style={{ width: '40px' }} /></td>
                                    <td style={{ textAlign: 'center' }}><input id={`pts-${e.id}`} defaultValue={e.puntos} style={{ width: '40px' }} /></td>
                                    <td style={{ textAlign: 'center' }}><input id={`pos-${e.id}`} defaultValue={e.posicion} style={{ width: '40px' }} /></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => {
                                            const pj = document.getElementById(`pj-${e.id}`).value;
                                            const pts = document.getElementById(`pts-${e.id}`).value;
                                            const pos = document.getElementById(`pos-${e.id}`).value;
                                            axios.put(`http://localhost:5000/api/admin/ranking/${e.id}`, { pj, puntos: pts, posicion: pos })
                                                .then(() => alert("Ranking actualizado"));
                                        }} style={btnOkStyle}>Guardar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {tab === 'tienda' && (
                    <div>
                        <h3>Nuevo Producto</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const producto = {
                                nombre: e.target.nombre.value,
                                precio: e.target.precio.value,
                                stock: e.target.stock.value,
                                categoria: e.target.categoria.value,
                                descripcion: e.target.descripcion.value,
                                imagen_url: e.target.imagen.value || 'https://via.placeholder.com/150'
                            };
                            axios.post('http://localhost:5000/api/admin/productos', producto).then(() => {
                                alert("Producto añadido");
                                e.target.reset();
                                cargarDatos();
                            });
                        }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <input name="nombre" placeholder="Nombre del producto" required style={inputStyle} />
                            <input name="precio" type="number" step="0.01" placeholder="Precio (€)" required style={inputStyle} />
                            <input name="stock" type="number" placeholder="Stock" required style={inputStyle} />
                            <input name="categoria" placeholder="Categoría (Ropa, Accesorios...)" required style={inputStyle} />
                            <input name="imagen" placeholder="URL de la imagen" style={inputStyle} />
                            <textarea name="descripcion" placeholder="Descripción" style={{ ...inputStyle, gridColumn: 'span 2' }} />
                            <button type="submit" style={{ ...btnOkStyle, gridColumn: 'span 2', padding: '12px' }}>PUBLICAR PRODUCTO</button>
                        </form>
                    </div>
                )}

                {tab === 'ventas' && (
                    data && data.length > 0 ? (
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
                                {data.map(v => {
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
                                                            axios.put(`http://localhost:5000/api/admin/ventas/${v.id}`, { estado: 'Enviado' })
                                                                .then(() => {
                                                                    alert("¡Pedido marcado como enviado!");
                                                                    cargarDatos();
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
                    ) : (
                        <p style={{ textAlign: 'center', padding: '20px' }}>No hay ventas registradas o cargando...</p>
                    )
                )}
            </div>
        </div>
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


export default AdminDashboard;