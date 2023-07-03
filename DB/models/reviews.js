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
  cardtype: {
    type: String
  },
  comment: {
    type: String
  },
  isactive: {
    type: Boolean,default:true
  },
  status: {
    type: String
  },
  submittedcard: {
    type: Number
  },
  netdv:{
    type:Number
  }
},{ timestamps: true });
module.exports = mongoose.model("review", reviewschema);
