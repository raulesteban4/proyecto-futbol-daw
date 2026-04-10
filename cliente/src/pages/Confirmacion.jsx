import { useLocation, useNavigate } from 'react-router-dom';
import './Confirmacion.css';

function Confirmacion() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos los datos que enviamos desde el Carrito
    const { pedidoId, total, productos } = location.state || {};

    if (!pedidoId) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>No se encontró información del pedido.</h2>
                <button onClick={() => navigate('/')}>Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="conf-container">
            <div className="conf-card">
                <div className="conf-icon">✅</div>
                <h1>¡Gracias por tu compra!</h1>
                <p>Tu pedido ha sido recibido correctamente.</p>
                
                <div className="conf-detalles">
                    <p><strong>Número de pedido:</strong> #{pedidoId}</p>
                    <p><strong>Total pagado:</strong> {total}€</p>
                </div>

                <div className="conf-productos">
                    <h3>Resumen:</h3>
                    <ul>
                        {productos.map((p, index) => (
                            <li key={index}>
                                {p.quantity}x {p.nombre}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="conf-acciones">
                    <button onClick={() => navigate('/perfil')} className="btn-perfil">Ver mis pedidos</button>
                    <button onClick={() => navigate('/tienda')} className="btn-tienda">Seguir comprando</button>
                </div>
            </div>
        </div>
    );
}

export default Confirmacion;