require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const { generateToken } = require('./controllers/authJWT');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: '*'
}));

const mongoString = process.env.DATABASE_URL;
const PORT = process.env.PORT;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});

// Login route to generate JWT token
app.post('/auth/token', generateToken);

// User routes
app.use('/api', require('./routes/userRoutes'));
// Vehicle routes
app.use('/api', require('./routes/vehicleRoutes'));

app.use("/api", require("./routes/questionRoutes"));
app.use("/api", require("./routes/answerRoutes"));

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () =>
  console.log(`UTN API service listening on port ${PORT}!`)
);