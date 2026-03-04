import { useEffect, useState } from 'react';
import axios from 'axios';

function Plantilla() {
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    // IMPORTANTE: Usa la URL que te funcionó en el navegador
    axios.get('http://localhost:5000/api/jugadores')
      .then(res => setJugadores(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Nuestra Plantilla</h1>
      <ul>
        {jugadores.map(j => (
          <li key={j.id}>{j.nombre} - {j.posicion}</li>
        ))}
      </ul>
    </div>
  );
}
export default Plantilla;   