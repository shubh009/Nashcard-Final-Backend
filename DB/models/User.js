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
  address: { type: String,default:"" },
  city: { type: String,default:"" },
  pincode: { type: Number,default:"" },
  state: { type: String,default:"" },
  orders: [orderschema],
  cards: [cardschema]
});

module.exports = mongoose.model("users", userschema);
