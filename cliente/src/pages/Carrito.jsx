import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import StripeCheckout from '../components/StripeCheckout';
import './Carrito.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Carrito() {
    const { cart, removeFromCart, clearCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();
    const [showPayment, setShowPayment] = useState(false);

    const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    const handleFinalizarCompra = () => {
        if (!user) {
            alert("Debes iniciar sesión para realizar un pedido.");
            navigate('/login');
            return;
        }
        setShowPayment(true);
    };

    if (cart.length === 0) {
        return (
            <div className="carrito-vacio">
                <h2>Tu carrito está vacío 🛒</h2>
                <p>¡Vuelve a la tienda para añadir productos oficiales!</p>
                <button onClick={() => navigate('/tienda')} className="btn-volver" style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                    Ir a la Tienda
                </button>
            </div>
        );
    }

    return (
        <div className="carrito-container">
            <h1>Tu Carrito</h1>
            <div className="carrito-lista">
                {cart.map(item => (
                    <div key={item.id} className="item-carrito">
                        <img src={item.imagen_url || 'https://www.paradas.es/export/sites/paradas/.galleries/imagenes-noticias-test/futbol_1576149772602.jpg'} alt={item.nombre} />
                        <div className="item-info">
                            <h3>{item.nombre}</h3>
                            <p>Precio: {item.precio}€</p>
                            <p>Cantidad: {item.quantity}</p>
                        </div>
                        <div className="item-subtotal">
                            <p>Subtotal: {(item.precio * item.quantity).toFixed(2)}€</p>
                            <button onClick={() => removeFromCart(item.id)} className="btn-quitar">
                                Quitar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="carrito-resumen">
                <h2>Total: {total.toFixed(2)}€</h2>
                <button className="btn-pagar" onClick={handleFinalizarCompra}>
                    FINALIZAR COMPRA
                </button>
            </div>

            {showPayment && (
                <StripeCheckout
                    total={total}
                    productos={cart}
                    onClose={() => setShowPayment(false)}
                />
            )}
        </div>
    );
}

export default Carrito;
