const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id_number: {
        type: String,
        unique: true,
        sparse: true,
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
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
    },
    google_id: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "active"],
        default: "pending"
    },
    activation_token: {
        type: String,
        default: null
    },
    two_fa_code: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
