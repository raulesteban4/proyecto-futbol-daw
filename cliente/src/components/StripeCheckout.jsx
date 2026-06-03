import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function CheckoutForm({ clientSecret, total, productos, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { paymentIntent, error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      const token = localStorage.getItem('token_fc_canaveral');
      try {
        const res = await axios.post(`${API}/api/pedidos`, {
          user_id: user.id,
          total: total.toFixed(2),
          productos,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        clearCart();
        navigate('/confirmacion', {
          state: {
            pedidoId: res.data.pedidoId,
            total: total.toFixed(2),
            productos,
          }
        });
      } catch (err) {
        setError('Error al guardar el pedido. Contacta con soporte.');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p style={{ color: '#ef4444', marginTop: 10 }}>{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: '100%',
          marginTop: 20,
          padding: 15,
          backgroundColor: loading ? '#94a3b8' : '#1e3a8a',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Procesando pago...' : `Pagar ${total.toFixed(2)}€`}
      </button>
    </form>
  );
}

export default function StripeCheckout({ total, productos, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const initPayment = async () => {
    const token = localStorage.getItem('token_fc_canaveral');
    try {
      const res = await axios.post(`${API}/api/create-payment-intent`,
        { amount: Math.round(total * 100) / 100 },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar el pago');
    }
    setLoading(false);
  };

  if (!stripePromise) {
    return (
      <div className="stripe-modal">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ color: '#dc2626' }}>Stripe no está configurado. Define VITE_STRIPE_PUBLISHABLE_KEY en .env</p>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  if (loading || !clientSecret) {
    return (
      <div className="stripe-modal">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <p>{loading ? 'Iniciando pago seguro...' : ''}</p>
          {error && <p style={{ color: '#ef4444' }}>{error}</p>}
          {!loading && !clientSecret && (
            <div>
              <button onClick={initPayment} style={{ padding: '10px 20px', cursor: 'pointer' }}>Reintentar</button>
              <button onClick={onClose} style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: 10 }}>Cancelar</button>
            </div>
          )}
          {loading && <div className="global-loading__spinner" style={{ margin: '20px auto' }}></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="stripe-modal-overlay" onClick={onClose}>
      <div className="stripe-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>Pago seguro</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} total={total} productos={productos} />
        </Elements>
      </div>
    </div>
  );
}
