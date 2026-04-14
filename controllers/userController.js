const jwt = require('jsonwebtoken');
bcrypt = require('bcryptjs');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

const userPost = async (req, res) => {

  try {

    // Hashear password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    let user = new User({
      id_number: req.body.id_number,
      name: req.body.name,
      last_name: req.body.last_name,
      birthdate: req.body.birthdate,
      email: req.body.email,
      password: hashedPassword
    });

    const savedUser = await user.save();

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

module.exports = {
  userPost,
  getAuthenticatedUser
};