import { useEffect, useState } from 'react';
import axios from 'axios';
import './Tienda.css';
import { useCart } from '../context/CartContext';

function Tienda() {
    const { cart, addToCart } = useCart();
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/productos')
            .then(res => setProductos(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="tienda-container">
            <h1 className="titulo-seccion">Tienda Oficial</h1>
            <div className="productos-grid">
                {productos.map(p => {
                    // 1. Calculamos cuánto de este producto hay ya en el carrito
                    const itemEnCarrito = cart?.find(item => item.id === p.id);
                    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.quantity : 0;

                    // 2. Calculamos el stock "real" disponible para el usuario en este momento
                    const stockRealDisponible = p.stock - cantidadEnCarrito;

                    return (
                        <div key={p.id} className="tarjeta-producto">
                            <img
                                src={p.imagen_url || 'https://www.paradas.es/export/sites/paradas/.galleries/imagenes-noticias-test/futbol_1576149772602.jpg'}
                                alt={p.nombre}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    filter: stockRealDisponible <= 0 ? 'grayscale(100%)' : 'none',
                                    opacity: stockRealDisponible <= 0 ? 0.7 : 1
                                }}
                            />
                            <div className="producto-info">
                                <span className="categoria-tag">{p.categoria}</span>
                                <h3 style={{ marginTop: '10px' }}>{p.nombre}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.descripcion}</p>
                                <p className="producto-precio">{p.precio}€</p>

                                {/* Indicador de stock dinámico */}
                                <p style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: stockRealDisponible <= 0 ? '#ef4444' : stockRealDisponible < 5 ? '#f59e0b' : '#10b981',
                                    marginBottom: '10px'
                                }}>
                                    {stockRealDisponible <= 0
                                        ? (p.stock <= 0 ? '🚫 Agotado' : '🚫 Límite alcanzado en carrito')
                                        : `Disponibles: ${stockRealDisponible}`}
                                </p>

                                <button
                                    className="btn-comprar"
                                    onClick={() => addToCart(p)}
                                    // Bloqueamos el botón si no hay stock físico o si el usuario ya alcanzó el límite en su carrito
                                    disabled={stockRealDisponible <= 0}
                                    style={{
                                        backgroundColor: stockRealDisponible <= 0 ? '#94a3b8' : '#002d72',
                                        cursor: stockRealDisponible <= 0 ? 'not-allowed' : 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    {stockRealDisponible <= 0 ? 'SIN STOCK' : 'AÑADIR AL CARRITO'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

}

export default Tienda;