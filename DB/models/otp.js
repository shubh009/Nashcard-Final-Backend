const mongoose = require('mongoose');
//const conn = require('../../DB/config');
const otpschema = new mongoose.Schema({
    email: String,
    otp: Number,
    expirein: Number,
},
    {

        timestamps: true

    })
let otp = mongoose.model('otp', otpschema, 'otp');
module.exports = otp; 