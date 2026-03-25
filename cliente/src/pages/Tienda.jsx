import { useEffect, useState } from 'react';
import axios from 'axios';
import './Tienda.css';
import { useCart } from '../context/CartContext';

function Tienda() {
    const { addToCart } = useCart();
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/productos') // Asegúrate de tener esta ruta en el server
            .then(res => setProductos(res.data))
            .catch(err => console.error(err));
    }, []);

    const añadirAlCarrito = (producto) => {
        alert(`Has añadido ${producto.nombre} al carrito (Simulado)`);
        // Aquí es donde en el futuro usaremos el "Estado Global" para el carrito
    };

    return (
        <div className="tienda-container">
            <h1 className="titulo-seccion">Tienda Oficial</h1>
            <div className="productos-grid">
                {productos.map(p => (
                    <div key={p.id} className="tarjeta-producto">
                        {/* Imagen por defecto si no hay URL en la BD */}
                        <img
                            src={p.imagen_url || 'https://www.paradas.es/export/sites/paradas/.galleries/imagenes-noticias-test/futbol_1576149772602.jpg'}
                            alt={p.nombre}
                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                        <div className="producto-info">
                            <span className="categoria-tag">{p.categoria}</span>
                            <h3 style={{ marginTop: '10px' }}>{p.nombre}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.descripcion}</p>
                            <p className="producto-precio">{p.precio}€</p>
                            <button className="btn-comprar" onClick={() => addToCart(p)}>
                                AÑADIR AL CARRITO
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}

export default Tienda;