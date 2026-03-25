import { useEffect, useState } from 'react';
import axios from 'axios';
import './Plantilla.css';

function Plantilla() {
  const [jugadores, setJugadores] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', posicion: '', dorsal: '', team_id: 1 });

  const obtenerJugadores = () => {
    axios.get('http://localhost:5000/api/jugadores')
      .then(res => setJugadores(res.data))
      .catch(err => console.error("Error al obtener:", err));
  };

  useEffect(() => { obtenerJugadores(); }, []);

  const fichar = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/jugadores', nuevo)
      .then(() => {
        obtenerJugadores();
        setNuevo({ nombre: '', posicion: '', dorsal: '', team_id: 1 });
      });
  };

  const eliminar = (id) => {
    if (window.confirm("¿Eliminar ficha?")) {
      axios.delete(`http://localhost:5000/api/jugadores/${id}`).then(() => obtenerJugadores());
    }
  };

  return (
    <div className="plantilla-container">
      <h1 className="titulo-seccion">Gestión de Plantilla</h1>

      {/* FORMULARIO DE FICHAJES (ADMIN) */}
      <section className="formulario-fichaje">
        <h3>Nuevo Fichaje</h3>
        <form onSubmit={fichar}>
          <input type="text" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
          <select value={nuevo.posicion} onChange={e => setNuevo({...nuevo, posicion: e.target.value})} required>
            <option value="">Posición</option>
            <option value="Portero">Portero</option>
            <option value="Defensa">Defensa</option>
            <option value="Centrocampista">Centrocampista</option>
            <option value="Delantero">Delantero</option>
          </select>
          <input type="number" placeholder="Dorsal" value={nuevo.dorsal} onChange={e => setNuevo({...nuevo, dorsal: e.target.value})} required />
          <button type="submit">AÑADIR A LA LISTA</button>
        </form>
      </section>
      <br /><br />

      {/* LISTADO DE JUGADORES */}
      <div className="jugadores-grid">
        {jugadores.length > 0 ? (
          jugadores.map(j => (
            <div key={j.id} className="tarjeta-jugador">
              <span className="dorsal">#{j.dorsal}</span>
              <h3 className="nombre-jugador">{j.nombre}</h3>
              <p className="posicion-jugador">{j.posicion}</p>
              <button className="btn-eliminar" onClick={() => eliminar(j.id)}>BAJA</button>
            </div>
          ))
        ) : (
          <p>Cargando jugadores o base de datos vacía...</p>
        )}
      </div>
    </div>
  );
}

export default Plantilla;