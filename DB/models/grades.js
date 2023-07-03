const mongoose = require("mongoose");

const gradeschema = new mongoose.Schema({
  ordernumber: { type: String },
  psasub: { type: String },
  cert: { type: String },
  grade: { type: String },
  Description: { type: String },
  card: { type: String },
  email: { type: Number },
  psaupcharge: { type: String },
  datepopped: { type: Date },
  frontimage: { type: String },
  backimage: { type: String },
  status:{type:String, default:'Quality and Assurance'}
});

module.exports = mongoose.model("Grades", gradeschema);
