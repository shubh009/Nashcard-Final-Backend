const mongoose = require("mongoose");
const orderschema = require("../models/gradingorder");
const cardschema = require("../models/newcardmodel");

const userschema = new mongoose.Schema({
  name: { type: String },
  lastname: { type: String },
  email: { type: String },
  password: { type: String },
  contact: { type: String },
  isactive: { type: Boolean },
  userid: { type: Number },
  orders: [orderschema],
  cards: [cardschema]
});

module.exports = mongoose.model("users", userschema);
