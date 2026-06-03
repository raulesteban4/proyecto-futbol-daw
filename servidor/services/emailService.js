const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderShipped(email, pedidoId) {
  const mailOptions = {
    from: `"FC Cañaveral" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📦 Pedido #${pedidoId} enviado — FC Cañaveral`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px">
        <div style="text-align:center;background:#1e3a5f;color:white;padding:20px;border-radius:12px 12px 0 0">
          <h1 style="margin:0">FC Cañaveral</h1>
        </div>
        <div style="padding:20px">
          <h2>¡Tu pedido está en camino! 🚚</h2>
          <p>Hemos marcado tu pedido <strong>#${pedidoId}</strong> como <strong style="color:#16a34a">ENVIADO</strong>.</p>
          <p>Recibirás tu pedido en los próximos días. Gracias por apoyar al FC Cañaveral.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
          <p style="color:#64748b;font-size:12px">Este mensaje se ha generado automáticamente desde la administración de FC Cañaveral.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de envío enviado a ${email} para pedido #${pedidoId}`);
  } catch (err) {
    console.error(`❌ Error al enviar email a ${email}:`, err.message);
  }
}

async function sendOrderConfirmation(email, pedidoId, total, productos) {
  const itemsHtml = productos.map(p =>
    `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">${p.nombre}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">x${p.quantity}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${(p.precio * p.quantity).toFixed(2)}€</td></tr>`
  ).join('');

  const mailOptions = {
    from: `"FC Cañaveral" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Pedido #${pedidoId} confirmado — FC Cañaveral`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px">
        <div style="text-align:center;background:#1e3a5f;color:white;padding:20px;border-radius:12px 12px 0 0">
          <h1 style="margin:0">FC Cañaveral</h1>
        </div>
        <div style="padding:20px">
          <h2>¡Pedido confirmado! 🎉</h2>
          <p>Gracias por tu compra. Estos son los detalles de tu pedido <strong>#${pedidoId}</strong>:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#f8fafc"><th style="padding:8px;text-align:left">Producto</th><th style="padding:8px">Cant.</th><th style="padding:8px;text-align:right">Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="font-size:18px;font-weight:bold;text-align:right">Total: <strong>${total}€</strong></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
          <p style="color:#64748b;font-size:12px">Recibirás otro correo cuando tu pedido sea enviado.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmación enviado a ${email} para pedido #${pedidoId}`);
  } catch (err) {
    console.error(`❌ Error al enviar confirmación a ${email}:`, err.message);
  }
}

module.exports = { sendOrderShipped, sendOrderConfirmation };
