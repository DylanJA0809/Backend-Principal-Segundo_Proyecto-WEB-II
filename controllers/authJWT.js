const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateCode, sendSMS } = require('./twilioService');

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !user.password) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        if (user.status === "pending") {
            return res.status(403).json({ message: "Cuenta pendiente de activación." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        // Generar código 2FA de 6 dígitos
        const code = generateCode();

        // Guardar el código en el usuario
        user.two_fa_code = code;
        await user.save();

        // Enviar SMS con el código
        await sendSMS(user.phone, code);

        // Responder indicando que se requiere verificación 2FA
        return res.status(200).json({
            requires2FA: true,
            email: user.email,
            message: "Código de verificación enviado a tu número de teléfono."
        });

    } catch (error) {
        console.error("Error en generateToken:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const verify2FA = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: "Email y código son requeridos." });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        if (!user.two_fa_code || user.two_fa_code !== code) {
            return res.status(401).json({ message: "Código de verificación incorrecto." });
        }

        // Invalidar el código después del uso
        user.two_fa_code = null;
        await user.save();

        // Generar el JWT de sesión
        const payload = {
            userId: user._id,
            email: user.email
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ token });

    } catch (error) {
        console.error("Error en verify2FA:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token requerido." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido o expirado." });
        }
        req.user = user;
        next();
    });
};

module.exports = { generateToken, verify2FA, authenticateToken };
