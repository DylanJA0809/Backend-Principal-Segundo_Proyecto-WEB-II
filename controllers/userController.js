const jwt = require('jsonwebtoken');
bcrypt = require('bcryptjs');
const User = require('../models/user');
const { getPersonaByCedula } = require('../services/padronService');

const JWT_SECRET = process.env.JWT_SECRET;

const userPost = async (req, res) => {

  try {

    const { id_number, email, password } = req.body;

    // Validar cédula en padrón
    const persona = await getPersonaByCedula(id_number);

    if (!persona) {
      return res.status(400).json({
        message: "La cédula no existe en el padrón"
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe"
      });
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con datos del padrón
    let user = new User({
      id_number,
      name: persona.NOMBRE,
      last_name: `${persona.PAPELLIDO} ${persona.SAPELLIDO}`,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();

    // Generar token
    const payload = {
      userId: savedUser._id,
      email: savedUser.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });

  } catch (err) {
    console.log('error while saving the user', err);
    res.status(500).json({
      error: "Error al registrar usuario"
    });
  }
};

const getAuthenticatedUser = async (req, res) => {

  try {

    // user validation is done in the authenticateToken middleware, so we can be sure that req.user is valid
    const user = await User
      .findById(req.user.userId)
      .select("-password"); // never return the password hash to the client

    if (!user) {
      return res.status(404);
    }

    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500); // Internal Server Error
  }
};

const getPadronByCedula = async (req, res) => {
  try {
    const { cedula } = req.params;
    const persona = await getPersonaByCedula(cedula);

    if (!persona) {
      // Cambiado a status 404
      return res.status(404).json({ error: "No encontrada" });
    }

    res.json({
      name: persona.NOMBRE,
      last_name: `${persona.PAPELLIDO} ${persona.SAPELLIDO}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  userPost,
  getAuthenticatedUser,
  getPadronByCedula
};