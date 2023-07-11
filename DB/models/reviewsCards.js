const mongoose = require("mongoose");

const reviewcardschema = new mongoose.Schema({
  userid: {
    type: Number
  },
  reviewid: {
    type: String
  },
  qty:  {
    type: Number
  },
  cardyear:  {
    type: Number
  },
  brand: {
    type: String
  },
  cardnumber:  {
    type: Number
  },
  playername: {
    type: String
  },
  attribute: {
    type: String
  },
  totalDV:  {
    type: Number
  }
});
module.exports = mongoose.model("reviewcard", reviewcardschema);
