const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub, email, given_name, family_name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: given_name,
        last_name: family_name,
        email,
        password: 0,
        google_id: sub
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      needsExtraData: !user.id_number
    });

  } catch (error) {
    res.status(500);
  }
};

const completeGoogleProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_number } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { id_number },
      { new: true }
    );

    res.json(user);

  } catch (error) {
    res.status(500);
  }
};

module.exports = {
  googleLogin,
  completeGoogleProfile
};