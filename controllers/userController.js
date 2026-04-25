const jwt = require('jsonwebtoken');
bcrypt = require('bcryptjs');
const User = require('../models/user');
const crypto = require("crypto"); 
const { sendActivationEmail } = require("./emailController");  

const JWT_SECRET = process.env.JWT_SECRET;

const userPost = async (req, res) => {

  try {

    // Hashear password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const activation_token = crypto.randomBytes(32).toString("hex");

    let user = new User({
      id_number: req.body.id_number,
      name: req.body.name,
      last_name: req.body.last_name,
      email: req.body.email,
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
    console.log('error while saving the user', err);
    res.status(422); // Unprocessable Entity
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

const activateUser = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ activation_token: token });

    if (!user) {
      return res.status(400);
    }

    user.status = "active";
    user.activation_token = null;
    await user.save();

    res.json(200);

  } catch (error) {
    res.status(500);
  }
};

const resendActivation = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404);
    }
    if (user.status === "active") {
      return res.status(400);
    }

    const activation_token = crypto.randomBytes(32).toString("hex");
    user.activation_token = activation_token;
    await user.save();

    await sendActivationEmail(email, activation_token);
    res.json(200);

  } catch (error) {
    res.status(500);
  }
};

module.exports = {
  userPost,
  getAuthenticatedUser,
  activateUser,
  resendActivation
};