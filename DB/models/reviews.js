const mongoose = require("mongoose");

const reviewschema = new mongoose.Schema({
  userid: {
    type: Number
  },
  reviewid: {
    type: String
  },
  companyname: {
    type: String
  },
  cardtye: {
    type: String
  },
  comment: {
    type: String
  },
  isactive: {
    type: Boolean
  }
});
module.exports = mongoose.model("review", reviewschema);
