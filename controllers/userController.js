const jwt = require('jsonwebtoken');
bcrypt = require('bcryptjs');
const User = require('../models/user');
const crypto = require("crypto");
const { sendActivationEmail } = require("./emailController");
const { consultarCedula } = require("./padronService");

const JWT_SECRET = process.env.JWT_SECRET;

const userPost = async (req, res) => {

    try {

        const { id_number, email, password, phone } = req.body;

        // 1. Validar que se envió la cédula
        if (!id_number) {
            return res.status(400).json({ message: "El número de cédula es obligatorio." });
        }

        // 2. Validar que se envió el teléfono
        if (!phone) {
            return res.status(400).json({ message: "El número de teléfono es obligatorio." });
        }

        // 3. Consultar la cédula en el padrón electoral (API PHP)
        const datosPadron = await consultarCedula(id_number);

        // 4. Si la cédula no existe en el padrón, no se permite el registro
        if (!datosPadron) {
            return res.status(400).json({ message: "La cédula ingresada no existe en el padrón electoral." });
        }

        // 5. Autocompletar nombre y apellidos desde el padrón
        const name = datosPadron.NOMBRE;
        const last_name = `${datosPadron.PAPELLIDO} ${datosPadron.SAPELLIDO}`.trim();

        // 6. Hashear password y crear token de activación
        const hashedPassword = await bcrypt.hash(password, 10);
        const activation_token = crypto.randomBytes(32).toString("hex");

        let user = new User({
            id_number,
            name,
            last_name,
            email,
            phone,
            password: hashedPassword,
            status: "pending",
            activation_token
        });

        const savedUser = await user.save();

        await sendActivationEmail(savedUser.email, activation_token);

        const payload = {
            userId: savedUser._id,
            email: savedUser.email
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });

    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.id_number) {
            return res.status(409).json({ message: "Esta cédula ya está registrada." });
        }
        if (err.code === 11000 && err.keyPattern?.email) {
            return res.status(409).json({ message: "Este correo electrónico ya está registrado." });
        }
        console.log('Error al registrar usuario:', err);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const getAuthenticatedUser = async (req, res) => {

    try {

        const user = await User
            .findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const activateUser = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ activation_token: token });

        if (!user) {
            return res.status(400).json({ message: "Token de activación inválido." });
        }

        user.status = "active";
        user.activation_token = null;
        await user.save();

        res.status(200).json({ message: "Cuenta activada exitosamente." });

    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const resendActivation = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        if (user.status === "active") {
            return res.status(400).json({ message: "La cuenta ya está activada." });
        }

        const activation_token = crypto.randomBytes(32).toString("hex");
        user.activation_token = activation_token;
        await user.save();

        await sendActivationEmail(email, activation_token);
        res.status(200).json({ message: "Correo de activación reenviado." });

    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

const getCedulaInfo = async (req, res) => {
    try {
        const { cedula } = req.params;

        const datosPadron = await consultarCedula(cedula);

        if (!datosPadron) {
            return res.status(404).json({ message: "Cédula no encontrada en el padrón electoral." });
        }

        res.status(200).json({
            name: datosPadron.NOMBRE,
            last_name: `${datosPadron.PAPELLIDO} ${datosPadron.SAPELLIDO}`.trim(),
            esMayorDeEdad: true
        });

    } catch (error) {
        console.error("Error consultando padrón:", error);
        res.status(500).json({ message: "Error al consultar el padrón electoral." });
    }
};

module.exports = {
    userPost,
    getAuthenticatedUser,
    activateUser,
    resendActivation,
    getCedulaInfo
};
