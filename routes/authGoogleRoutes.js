const express = require("express");
const router = express.Router();

const {
  googleLogin,
  completeGoogleProfile
} = require("../controllers/authGoogleController");

const { authenticateToken } = require("../controllers/authJWT");

router.post("/auth/google", googleLogin);

// Completar perfil
router.post("/auth/complete-profile", authenticateToken, completeGoogleProfile);

module.exports = router;