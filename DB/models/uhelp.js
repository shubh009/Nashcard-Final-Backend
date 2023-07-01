const mongoose = require("mongoose");

const uhelpchema = new mongoose.Schema({
  userid: {
    type: Number,
    required: true
  },
  qtopic: {
    type: String,
    required: true
  },
  qtitle: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  isactive: {
    type: Boolean
  }
});
module.exports = mongoose.model("uhelp", uhelpchema);
