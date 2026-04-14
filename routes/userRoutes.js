const express = require('express');
const router = express.Router();

const { userPost, getAuthenticatedUser } = require("../controllers/userController");
const { authenticateToken } = require("../controllers/authJWT");

// POST - Register user
router.post('/user', userPost);

// GET - Authenticated user (requires token)
router.get('/auth/user', authenticateToken, getAuthenticatedUser);

module.exports = router;