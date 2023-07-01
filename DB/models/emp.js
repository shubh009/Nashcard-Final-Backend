const mongoose = require("mongoose");

const empschema = new mongoose.Schema({
  adminid: { type: Number },
  name: { type: String },
  email: { type: String },
  password: { type: String },
  contact: { type: String },
  isactive: { type: Boolean },
  adminlevel: { type: Number }
});

module.exports = mongoose.model("employeLogin", empschema);
