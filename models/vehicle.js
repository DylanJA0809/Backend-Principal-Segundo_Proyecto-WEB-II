const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    brand: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    year: {
        type: Number
    },
    price: {
        type: Number
    },
    image_path: {
        type: String,
        required: true
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Disponible', 'Vendido'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);