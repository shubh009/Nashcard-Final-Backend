const mongoose = require("mongoose");

const servicelevelschema = new mongoose.Schema({
  servicelevelid: {
    type: Number,
    required: true
  },
  servicelevel: {
    type: String,
    required: true
  },
  minimumcards: {
    type: Number
  },
  pricepercard: {
    type: Number,
    required: true
  },
  acceptedyears: {
    type: String,
    required: true
  },
  accepteddv: {
    type: Number,
    required: true
  },
  returntime: {
    type: String
  },
  gradingcompany: {
    type: String
  },
  isactive: {
    type: Boolean
  }
});
module.exports = mongoose.model("servicelevel", servicelevelschema);
