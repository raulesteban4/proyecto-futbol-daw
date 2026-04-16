import axios from 'axios';
import './tabs.css';

function PartidosTab({ data, setData }) {

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get('http://localhost:5000/api/partidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar partidos:", err));
    };

    return (
        <div>
            <div className="form-box">
                <h3>Programar Nuevo Partido</h3>
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
                }} className="form-box-form">
                    <input name="rival" placeholder="Rival" required className="form-input" style={{ flex: 1 }} />
                    <input name="ubicacion" placeholder="Campo / Ubicación" required className="form-input" style={{ flex: 1 }} />
                    <input name="fecha" type="datetime-local" required className="form-input" style={{ width: 'auto' }} />
                    <button type="submit" className="btn-ok">+ Añadir</button>
                </form>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Partido</th>
                        <th>Fecha y Hora</th>
                        <th>Ubicación</th>
                        <th>Goles L/V</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(m => (
                        <tr key={m.id}>
                            <td>
                                <input id={`riv-${m.id}`} defaultValue={m.rival} className="form-input" style={{ fontWeight: 'bold' }} />
                            </td>
                            <td className="text-center">
                                <input
                                    id={`fec-${m.id}`}
                                    type="datetime-local"
                                    defaultValue={m.fecha ? new Date(m.fecha).toISOString().slice(0, 16) : ''}
                                    className="form-input"
                                />
                            </td>
                            <td className="text-center">
                                <input id={`ubi-${m.id}`} defaultValue={m.ubicacion} className="form-input" />
                            </td>
                            <td className="text-center white-space-nowrap">
                                <input type="number" defaultValue={m.goles_local} id={`gl-${m.id}`} className="stat-input" style={{ width: '40px' }} />
                                <span> - </span>
                                <input type="number" defaultValue={m.goles_visitante} id={`gv-${m.id}`} className="stat-input" style={{ width: '40px' }} />
                            </td>
                            <td className="text-center">
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
                                }} className="btn-ok">Guardar</button>

                                <button onClick={() => {
                                    if (window.confirm("¿Eliminar partido?")) {
                                        const token = localStorage.getItem('token_fc_canaveral');
                                        axios.delete(`http://localhost:5000/api/admin/partidos/${m.id}`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        }).then(() => cargarDatos());
                                    }
                                }} className="btn-delete btn-delete-margin">Borrar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PartidosTab;
