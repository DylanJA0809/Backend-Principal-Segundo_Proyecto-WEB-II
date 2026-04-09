const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id_number: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    last_name: {
        type: String,
        trim: true
    },
    birthdate: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);