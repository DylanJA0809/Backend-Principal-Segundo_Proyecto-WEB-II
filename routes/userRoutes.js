const express = require('express');
const router = express.Router();

const { userPost, getAuthenticatedUser, getPadronByCedula } = require("../controllers/userController");
const { authenticateToken } = require("../controllers/authJWT");

// POST - Register user
router.post('/user', userPost);

// GET - Authenticated user (requires token)
router.get('/auth/user', authenticateToken, getAuthenticatedUser);

// GET - Get padron information by cedula
router.get('/padron/:cedula', getPadronByCedula);

module.exports = router;