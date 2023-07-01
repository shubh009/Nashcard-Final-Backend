const mongoose = require("mongoose");
//const conn = require('../../DB/config');

const cardmodelschema = new mongoose.Schema({
  userid: Number,
  orderid: String,
  rowid: Number,
  qty: Number,
  cardyear: Number,
  brand: String,
  cardnumber: Number,
  playername: String,
  attribute: String,
  totalDV: Number
  // insuranceAmt: Number,
  // trackingno: Number
});

module.exports = cardmodelschema;
