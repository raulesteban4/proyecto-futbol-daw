import { useState, useEffect } from 'react';
import axios from 'axios';
import './tabs.css';

function PlantillaTab({ data, setData }) {

    const cargarDatos = () => {
        const token = localStorage.getItem('token_fc_canaveral');
        axios.get('http://localhost:5000/api/jugadores', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error("Error al cargar jugadores:", err));
    };

    return (
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
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(() => {
                        alert("¡Jugador fichado con éxito!");
                        e.target.reset();
                        cargarDatos();
                    })
                    .catch((error) => {
                        if (error.response && error.response.status === 400) {
                            alert("Error: " + error.response.data.message);
                        } else {
                            alert("Ocurrió un error inesperado al fichar al jugador.");
                        }
                    });
            }} className="tab-form">
                <input name="nombre" placeholder="Nombre" required className="form-input" />
                <select
                    name="posicion"
                    required
                    className="form-select"
                >
                    <option value="">Selecciona Posición</option>
                    <option value="Portero">Portero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Centrocampista">Centrocampista</option>
                    <option value="Delantero">Delantero</option>
                </select>
                <input name="dorsal" type="number" placeholder="Dorsal" required style={{ width: '80px', padding: '8px' }} />
                <button type="submit" className="btn-ok">Añadir</button>
            </form>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>Jugador</th>
                        <th>Dorsal</th>
                        <th>Goles</th>
                        <th>Asist.</th>
                        <th>Amarillas/Rojas</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(j => (
                        <tr key={j.id}>
                            <td>
                                <div className="text-bold">{j.nombre}</div>
                                <div className="text-small text-muted">{j.posicion}</div>
                            </td>
                            <td className="text-center">
                                <input id={`dor-${j.id}`} defaultValue={j.dorsal} type="number" className="stat-input stat-input.blue" />
                            </td>
                            <td className="text-center">
                                <input id={`gol-${j.id}`} defaultValue={j.goles} type="number" className="stat-input" />
                            </td>
                            <td className="text-center">
                                <input id={`ast-${j.id}`} defaultValue={j.asistencias} type="number" className="stat-input" />
                            </td>
                            <td className="text-center">
                                <input id={`am-${j.id}`} defaultValue={j.amarillas} type="number" className="stat-input stat-input.yellow" title="Amarillas" />
                                <input id={`rj-${j.id}`} defaultValue={j.rojas} type="number" className="stat-input stat-input.red" title="Rojas" />
                            </td>
                            <td className="text-center">
                                <button onClick={() => {
                                    const token = localStorage.getItem('token_fc_canaveral');
                                    const datosActualizados = {
                                        dorsal: document.getElementById(`dor-${j.id}`).value,
                                        goles: document.getElementById(`gol-${j.id}`).value,
                                        asistencias: document.getElementById(`ast-${j.id}`).value,
                                        amarillas: document.getElementById(`am-${j.id}`).value,
                                        rojas: document.getElementById(`rj-${j.id}`).value
                                    };
                                    axios.put(`http://localhost:5000/api/admin/jugadores/stats/${j.id}`, datosActualizados, {
                                        headers: { 'Authorization': `Bearer ${token}` }
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
                                }} className="btn-ok">Actualizar</button>
                                <button onClick={() => {
                                    if (window.confirm("¿Dar de baja?")) {
                                        const token = localStorage.getItem('token_fc_canaveral');
                                        axios.delete(`http://localhost:5000/api/jugadores/${j.id}`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        }).then(() => cargarDatos());
                                    }
                                }} className="btn-delete btn-delete-margin">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlantillaTab;
