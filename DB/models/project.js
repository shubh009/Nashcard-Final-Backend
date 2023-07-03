const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const projectschema = new Schema({
  projectTitle: { type: String },
  status: { type: String },
  dueDate: { type: Date },
  assignedMember: { type: String },
  description: { type: String },
  createdBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("project", projectschema);
