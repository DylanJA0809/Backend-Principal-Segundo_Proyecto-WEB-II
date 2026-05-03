const express = require('express');
const router = express.Router();

const { userPost, getAuthenticatedUser, activateUser, resendActivation, getCedulaInfo } = require("../controllers/userController");
const { authenticateToken } = require("../controllers/authJWT");

// POST - Registrar usuario (valida cédula contra el padrón)
router.post('/user', userPost);

// GET - Consultar cédula en el padrón (autocompletado en formulario de registro)
router.get('/cedula/:cedula', getCedulaInfo);

// GET - Usuario autenticado (requiere token)
router.get('/auth/user', authenticateToken, getAuthenticatedUser);

router.get('/activate/:token', activateUser);

router.post('/resend-activation', resendActivation);

module.exports = router;
