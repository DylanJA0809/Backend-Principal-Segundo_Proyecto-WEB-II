const express = require("express");
const router = express.Router();

const { answerPost, answerGet } = require("../controllers/answerController");
const { authenticateToken } = require("../controllers/authJWT");

router.post("/answer", authenticateToken, answerPost);
router.get("/answer", authenticateToken, answerGet);

module.exports = router;