const mongoose = require("mongoose");

const orderschema = new mongoose.Schema({
  orderid: String,
  orderType: String,
  createdate: { type: Date, default: Date.now },
  servicelevel: String,
  grcompanyname: String,
  cardcount: Number,
  localpickup: Number,
  totaldv: Number,
  insuranceammount: Number,
  pricepercard: Number,
  isactive: Boolean,
  calculatedtotalcard: Number,
  caculatedinsurancecost: Number,
  totalprice: Number,
  revewcardfee: Number,
  shippingfee: Number,
  textmessagealert: Number,
  userid: Number,
  isordercomplete: Boolean,
  orderStatus: String,
  SGCphotoid: Number,
  NonLoggedCardCount: Number,
  LoggedCardCount: Number,
  Percardpriceofnonloggedcard: Number,
  cardsaverqty: Number,
  cardsaverprice: Number,
  PSASub: Number,
  PSAUpcharge: String,
  CustomerCSV: Boolean,
  DropoffLocation: String,
  paymentlink: String,
  autographcount: Number,
  isorderpaid: Boolean,
  NumberOfKicksfromservicelevel: Number,
  Kicksfromreview: Number,
  NumberofReviewPasses: Number,
  PassesPrice: Number,
  Gardespopdate: Date,
  CardrecivedDate: Date,
  CardsenttoPSADate: Date,
  CustomerInvoicedDate: Date,
  Orderconfirmed: Boolean,
paiddate:Date,
  ordernotes: [
    {
      noteid: { type: Number, default: 9090 },
      adminid: { type: Number, default: 909090 },
      notes: { type: String, default: "abc" },
      notedate: { type: Date, default: Date.now }
    }
  ],

  grades: [
    {
      orderid: { type: String },
      cert: { type: String },
      grade: { type: String },
      description: { type: String },
      PSAsub: { type: Number },
      poppedDate: { type: Date },
      PSAUpchargeAmmount: { type: Number },
      frontImage: { type: String },
      backimage: { type: String }
    }
  ]
});

module.exports = orderschema;
