const mongoose = require('mongoose');

const newDeliveryAddressSchema = new mongoose.Schema({
    orderID: {
        type: String,
        required: true,
        unique: true
    },
    pincode: {
        type: String,
        default:0,
    },
    city: {
        type: String,
        default:" ",
    },
    state: {
        type: String,
        default:" ",
    },
    country: {
        type: String,
        default:" ",
    },
    pickup:{type: Boolean, required:true} // true if user select pickup, false if user wants to delivery on his address
}, {
    timestamps: true,
});

const newDeliveryAddress = mongoose.model('newDeliveryAddress', newDeliveryAddressSchema);

module.exports = newDeliveryAddress;