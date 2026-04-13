const jwt = require('jsonwebtoken');
const SECRET_KEY = "f8a2_!99_DsK2l-02mZ_QpX92_#canaveral_secure_2026";

// Proteger rutas
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).send("Acceso denegado. No hay token.");

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(401).send("Sesión caducada o token inválido.");
        req.user = user; // Guardamos los datos del usuario en la petición
        next();
    });
};

module.exports = verificarToken;