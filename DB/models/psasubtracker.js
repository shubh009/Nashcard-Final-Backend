const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const psasubschema = new Schema({
  gradespoppeddate: { type: Date },
  psacurrentstatus: { type: String },
  subnumber: { type: Number },
  creationdate: { type: Date },
  ordernumber:{type: Number},
  servicetype:{type:String},
  psaorderprogresstep:{type:String},
  trackingnumber:{type:String},
  arrived:{type:Boolean},
  orderprep:{type:Boolean},
  researchandid:{type:Boolean},
  grading:{type:Boolean},
  assembly:{type:Boolean},
  qacheck1:{type:Boolean},
  qacheck2:{type:Boolean},
  shipped:{type:Boolean},
  complete:{type:String},
  raw:{type:String},
  gradespopped:{type:Boolean},
  equationlinkfortracking:{type:String}
}, { timestamps: true });

module.exports = mongoose.model("psasubtracker", psasubschema);
