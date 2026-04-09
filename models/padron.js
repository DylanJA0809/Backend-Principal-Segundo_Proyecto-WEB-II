const mongoose = require('mongoose');
const padronConnection = require('../dbPadron');

const padronSchema = new mongoose.Schema({}, { strict: false });

module.exports = padronConnection.model(
  'padron',
  padronSchema,
  'padron'
);