import axios from 'axios';
import './tabs.css';

function ClasificacionTab({ data, setData }) {

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get('http://localhost:5000/api/clasificacion', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar clasificación:", err));
    };

    return (
        <div>
            <div className="form-box">
                <h3>Añadir Equipo a la Liga</h3>
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
                }} className="form-box-form">
                    <input name="equipo" placeholder="Nombre del Equipo" required className="form-input" style={{ flex: 2 }} />
                    <input name="pj" type="number" placeholder="PJ" className="form-input" style={{ flex: 0.5 }} />
                    <input name="puntos" type="number" placeholder="Pts" className="form-input" style={{ flex: 0.5 }} />
                    <input name="posicion" type="number" placeholder="Pos" className="form-input" style={{ flex: 0.5 }} />
                    <button type="submit" className="btn-ok">+ Añadir</button>
                </form>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Equipo</th>
                        <th>PJ</th>
                        <th>Pts</th>
                        <th>Posición</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(e => (
                        <tr key={e.id}>
                            <td>
                                <input id={`nom-e-${e.id}`} defaultValue={e.equipo} className="form-input" style={{ fontWeight: 'bold' }} />
                            </td>
                            <td className="text-center">
                                <input id={`pj-${e.id}`} type="number" defaultValue={e.pj} style={{ width: '50px' }} />
                            </td>
                            <td className="text-center">
                                <input id={`pts-${e.id}`} type="number" defaultValue={e.puntos} style={{ width: '50px' }} />
                            </td>
                            <td className="text-center">
                                <input id={`pos-${e.id}`} type="number" defaultValue={e.posicion} style={{ width: '50px' }} />
                            </td>
                            <td className="text-center">
                                <div className="flex-center">
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
                                    }} className="btn-ok">Guardar</button>

                                    <button onClick={() => {
                                        if (window.confirm(`¿Seguro que quieres eliminar a ${e.equipo}?`)) {
                                            const token = localStorage.getItem('token_fc_canaveral');
                                            axios.delete(`http://localhost:5000/api/admin/ranking/${e.id}`, {
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            }).then(() => cargarDatos());
                                        }
                                    }} className="btn-delete">Borrar</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ClasificacionTab;
