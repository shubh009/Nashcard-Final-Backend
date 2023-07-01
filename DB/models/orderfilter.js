const mongoose = require("mongoose");

const orderStatus = new mongoose.Schema({
  filterName: {
    type: String,
    required: true
  },
  isactive: {
    type: Boolean
  }
});
module.exports = mongoose.model("orderStatu", orderStatus);
