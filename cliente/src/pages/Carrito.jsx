import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Carrito.css';

function Carrito() {
    const { cart, removeFromCart, clearCart } = useCart();
    const { user } = useUser();
    const navigate = useNavigate();

    // Calcular el precio total de la compra
    const total = cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0);

    const handleFinalizarCompra = () => {
        // 1. Verificar si el usuario está logueado
        if (!user) {
            alert("⚠️ Debes iniciar sesión para realizar un pedido.");
            navigate('/login');
            return;
        }

        // 2. Enviar el pedido al servidor (Backend)
        axios.post('http://localhost:5000/api/pedidos', {
            user_id: user.id,
            total: total
        })
        .then(res => {
            alert(`¡Pedido realizado con éxito! ID de pedido: ${res.data.pedidoId}`);
            clearCart(); // 3. Vaciar el carrito en el contexto
            navigate('/'); // 4. Redirigir al inicio
        })
        .catch(err => {
            console.error(err);
            alert("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
        });
    };

    if (cart.length === 0) {
        return (
            <div className="carrito-vacio">
                <h2>Tu carrito está vacío 🛒</h2>
                <p>¡Vuelve a la tienda para añadir productos oficiales!</p>
            </div>
        );
    }

    return (
        <div className="carrito-container">
            <h1>Tu Carrito</h1>
            <div className="carrito-lista">
                {cart.map(item => (
                    <div key={item.id} className="item-carrito">
                        <img src={item.imagen_url || 'https://via.placeholder.com/100'} alt={item.nombre} />
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
        </div>
    );
}

export default Carrito;