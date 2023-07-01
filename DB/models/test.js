const mongoose = require("mongoose");

const testschema = new mongoose.Schema({
  userid: {
    type: Number
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  emailid: {
    type: String
  },
  phone: {
    type: String
  },
  gender: {
    type: String
  },
  intrestedIn: {
    type: String
  },
  youare: {
    type: String
  },
  showGender: {
    type: Boolean
  },
  country: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  zipcode: {
    type: String
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  isactive: {
    type: Boolean
  }
});
module.exports = mongoose.model("pofprofile", testschema);
