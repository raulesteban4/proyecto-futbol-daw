import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function PushSubscribe() {
  const [status, setStatus] = useState('loading');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) {
      setStatus('unsupported');
      return;
    }
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
        setStatus('idle');
      });
    });
  }, []);

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await axios.post(`${API}/api/subscribe`, sub);
      setSubscribed(true);
    } catch (err) {
      console.error('Error al suscribirse a notificaciones:', err);
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await axios.post(`${API}/api/unsubscribe`, { endpoint: sub.endpoint });
        await sub.unsubscribe();
        setSubscribed(false);
      }
    } catch (err) {
      console.error('Error al desuscribirse:', err);
    }
  };

  if (status === 'unsupported' || status === 'loading') return null;

  return (
    <div className="push-subscribe">
      {subscribed ? (
        <button onClick={unsubscribe} className="push-btn push-btn--active" title="Notificaciones activadas">
          🔔 Activado
        </button>
      ) : (
        <button onClick={subscribe} className="push-btn push-btn--inactive" title="Activar notificaciones">
          🔕 Notificaciones
        </button>
      )}
    </div>
  );
}
