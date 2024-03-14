const mongoose = require('mongoose');

const newDeliveryAddressSchema = new mongoose.Schema({
    orderID: {
        type: String,
        required: true,
        unique: true
    },
    userID: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
        default:0,
    },
    city: {
        type: String,
        required: true,
        default:" ",
    },
    state: {
        type: String,
        required: true,
        default:" ",
    },
    country: {
        type: String,
        required: true,
        default:" ",
    }
}, {
    timestamps: true,
});

const newDeliveryAddress = mongoose.model('newDeliveryAddress', newDeliveryAddressSchema);

module.exports = newDeliveryAddress;