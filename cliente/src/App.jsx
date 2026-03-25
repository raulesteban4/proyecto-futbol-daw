import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [jugadores, setJugadores] = useState([])

  useEffect(() => {
    // Usamos la URL que te funciona en el navegador
    axios.get('http://localhost:5000/api/jugadores')
      .then(res => setJugadores(res.data))
      .catch(err => console.log("Error conectando con el servidor:", err))
  }, [])

  const obtenerJugadores = () => {
    axios.get('http://localhost:5000/api/jugadores')
      .then(res => {
        setJugadores(res.data);
      })
      .catch(err => console.log("Error al obtener:", err));
  };

  // FUNCIÓN PARA ELIMINAR
  const eliminarJugador = (id) => {
    if (window.confirm("¿Deseas eliminar a este jugador?")) {
      axios.delete(`http://localhost:5000/api/jugadores/${id}`)
        .then(() => {
          // Lo borramos del estado de React directamente
          // Así desaparece visualmente al instante sin esperar al servidor
          setJugadores(prevJugadores => prevJugadores.filter(j => j.id !== id));
          console.log("Borrado con éxito");
        })
        .catch(err => {
          console.error("Error al borrar:", err);
          // Si da error, refrescamos por si acaso
          obtenerJugadores();
        });
    }
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#1e3a8a', fontSize: '3rem', margin: '0' }}>FC CAÑAVERAL</h1>
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>PANEL DE GESTIÓN OFICIAL</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '10px', color: '#334155' }}>
          Plantilla Actual
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {jugadores.map(j => (
            <div key={j.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              borderLeft: '5px solid #1e3a8a',
              display: 'flex',             // Añadido para organizar el botón
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: 'bold' }}>#{j.dorsal}</span>
                <h3 style={{ margin: '5px 0', color: '#1e293b' }}>{j.nombre}</h3>
                <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>{j.posicion}</p>
              </div>

              {/* BOTÓN DE ELIMINAR */}
              <button 
                onClick={() => eliminarJugador(j.id)}
                style={{
                  marginTop: '15px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#fecaca'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#fee2e2'}
              >
                ELIMINAR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App