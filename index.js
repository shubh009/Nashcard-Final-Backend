const express = require("express");
const app = express();
require("dotenv").config();
var mongoose = require("mongoose");
const User = require("./DB/models/User");
const OTP = require("./DB/models/otp");
const { orderModel } = require("./DB/models/gradingorder");
const nodemailer = require("nodemailer");
const servicelevel = require("./DB/models/servicelevel");
const empLogin = require("./DB/models/emp");
const ureviews = require("./DB/models/reviews");
const Grades = require("./DB/models/grades");
const cors = require("cors");
const otp = require("./DB/models/otp");
const reviews = require("./DB/models/reviews");
const uhelp = require("./DB/models/uhelp");
const orderStatus = require("./DB/models/orderfilter");
const testProfile = require("./DB/models/test");
const project = require("./DB/models/project");
const { request } = require("express");
const fileUpload = require("express-fileupload");
const psasubtracker = require("./DB/models/psasubtracker");
const reviewcards = require("./DB/models/reviewsCards");
const axios = require("axios");
const { ObjectId } = require("mongodb");
var moment = require("moment");
const connectDatabase = require("./DB/config");
const emp = require("./DB/models/emp");
app.use(express.json());

app.use(fileUpload());
var options = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

connectDatabase()
  .then(() => {
    console.log(process.env.PORT);
    app.listen(process.env.PORT, () => {
      console.log(
        `Server started on Port : ${process.env.PORT} in ${process.env
          .NODE_ENV}`
      );
    });
  })
  .catch(err => {
    console.log(err);
  });

app.use(cors(options));

app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  resp.send(result);
});

app.post("/adminregister", async (req, resp) => {
  let adminuser = new empLogin(req.body);
  let result = await adminuser.save();
  result = result.toObject();
  delete result.password;
  resp.send(result);
});

app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      resp.send(user);
    } else {
      let emp = await empLogin.findOne(req.body).select("-password");
      if (emp) {
        resp.send(emp);
      } else {
        resp.send({
          result: "No user found. Please enter correct email & password"
        });
      }
    }
  } else {
    resp.send({ result: "Email & Password both are required for login." });
  }
});

app.post("/getprofile", async (req, resp) => {
  if (req.body.userid) {
    let profile = await User.findOne({ userid: req.body.userid }).select(
      "name lastname email contact address city pincode state"
    );
    console.log(profile);
    if (profile) {
      resp.send(profile);
    } else {
      resp.send({
        result: "No user found. Please enter correct email & password"
      });
    }
  } else {
    resp.send({ result: "Email & Password both are required for login." });
  }
});

app.patch("/updateprofileFromUser", async (req, resp) => {
  const { userid, lastname } = req.body;
  const Ufirstname = req.body.name;
  const Ucontact = req.body.contact;

  const email = req.body.email;
  let user = await User.findOneAndUpdate(
    { userid: userid },
    {
      $set: {
        name: Ufirstname,
        lastname: lastname,
        contact: parseInt(Ucontact)
      }
    },
    { new: true }
  );
  resp.send({ user: "Profile Information has been updated" });

  // console.log(newUser);
});

app.patch("/updateprofile", async (req, resp) => {
  const { userid, lastname } = req.body;
  const Ufirstname = req.body.name;
  const Ucontact = req.body.contact;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.stat;
  const pincode = req.body.pincode;
  const email = req.body.email;
  let user = await User.findOneAndUpdate(
    { userid: userid },
    {
      $set: {
        name: Ufirstname,
        astname: lastname,
        contact: parseInt(Ucontact),
        email: email,
        address: address,
        city: city,
        state: state,
        pincode: parseInt(pincode)
      }
    },
    { new: true }
  );
  resp.send({ user: "Profile Information has been updated" });

  // console.log(newUser);
});

app.patch("/updateaddress", async (req, resp) => {
  const userid = req.body.userid;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const pincode = req.body.pincode;
  console.log(address);
  console.log(req.body.state);
  let user = await User.findOneAndUpdate(
    { userid: userid },
    {
      $set: {
        address: address,
        city: city,
        state: state,
        pincode: pincode
      }
    },
    { new: true }
  );
  resp.send({ user: "Profile Information has been updated" });

  // console.log(newUser);
});

app.post("/sendorderemail", async (req, resp) => {
  if (req.body.uemail) {
    console.log(req.body.uemail);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gupta.shubhanshu007@gmail.com",
        pass: "bjzvvlumhuimipwq"
      }
    });

    let message = {
      from: "gupta.shubhanshu007@gmail.com",
      to: req.body.uemail,
      subject: "Thanks For Your Order With Nashcard",
      text:
        "Thank you for your order with Nashcard. We will send you an email with order detail link. So, you can track your order. "
    };

    transporter.sendMail(message, function(error, info) {
      if (error) {
        resp.status(500).json("Email not sent: ");
      } else {
        console.log("Email sent: ");
        resp.status(200).json("Email sent: ");
      }
    });
  } else {
    resp.status(500).json("Email Error: Email Not Found");
  }
});

app.post("/order", async (req, resp) => {
  const validuser = await User.findOne({ userid: req.body.userid });
  console.log("save order" + req.body.userid);
  if (!validuser) {
    return resp
      .status(401)
      .json({ error: "user with that user id is not exist" });
  } else {
    const neworder = {
      orderid: req.body.orderid,
      orderType: req.body.orderType,
      servicelevel: req.body.servicelevel,
      grcompanyname: req.body.grcompanyname,
      cardcount: req.body.cardcount,
      localpickup: req.body.localpickup,
      totaldv: req.body.totaldv,
      insuranceammount: req.body.insuranceammount,
      pricepercard: req.body.pricepercard,
      calculatedtotalcard: req.body.calculatedtotalcard,
      isactive: true,
      caculatedinsurancecost: req.body.caculatedinsurancecost,
      TotalPrice: 0,
      ShippingFee: req.body.ShippingFee,
      textmessagealert: req.body.textmessagealert,
      userid: req.body.userid,
      isordercomplete: req.body.isordercomplete,
      orderStatus: req.body.orderStatus,
      SGCphotoid: req.body.SGCphotoid,
      NonLoggedCardCount: req.body.NonLoggedCardCount,
      LoggedCardCount: req.body.LoggedCardCount,
      cardsaverqty: req.body.cardsaverqty,
      cardsaverprice: req.body.cardsaverprice,
      PSASub: req.body.PSASub,
      PSAUpcharge: req.body.PSAUpcharge,
      CustomerCSV: req.body.CustomerCSV,
      DropoffLocation: req.body.DropoffLocation,
      paymentlink: req.body.paymentlink,
      autographcount: req.body.autographcount,
      isorderpaid: req.body.isorderpaid,
      NumberOfKicksfromservicelevel: 0,
      Kicksfromreview: 0,
      NumberofReviewPasses: 0,
      PassesPrice: 0,
      Percardpriceofnonloggedcard: 0,
      Gardespopdate: req.body.Gardespopdate,
      CardrecivedDate: req.body.CardrecivedDate,
      CardrecivedDate: req.body.CardrecivedDate,
      CustomerInvoicedDate: req.body.CustomerInvoicedDate,
      Orderconfirmed: false,
      ordernotes: [
        {
          noteid: req.body.noteid,
          adminid: req.body.adminid,
          notes: req.body.notes
        }
      ],
      grades: [
        // {
        //   // orderid: req.body.orderid,
        //   // cert: req.body.cert,
        //   // grade: req.body.grade,
        //   // description: req.body.description,
        //   // gradeDate: req.body.gradeDate
        // }
      ]
    };

    validuser.orders.push(neworder);
    validuser.save();
    resp.status(200).json(validuser);
  }
});

app.post("/addReviewcard", async (req, resp) => {
  console.log("Api is calling");
  let newreviewCard = new reviewcards(req.body);
  let result = await newreviewCard.save();
  result = result.toObject();
  resp.status(200).json({ isSave: "true", Result: result });
});

app.post("/addcard", async (req, resp) => {
  const validuser = await User.findOne({ userid: req.body.userid });

  if (!validuser) {
    return resp
      .status(401)
      .json({ error: "user with that user id is not exist" });
  } else {
    const newcard = {
      userid: req.body.userid,
      orderid: req.body.orderid,
      rowid: req.body.rowid,
      qty: req.body.qty,
      cardyear: req.body.cardyear,
      brand: req.body.brand,
      cardnumber: req.body.cardnumber,
      playername: req.body.playername,
      attribute: req.body.attribute,
      totalDV: req.body.totalDV
    };

    const newUser = await User.findOneAndUpdate(
      { userid: req.body.userid },
      { $addToSet: { cards: newcard } },
      { new: true }
    );

    const user = await User.findOne({ userid: req.body.userid });
    if (!user) {
      return resp
        .status(401)
        .json({ error: "User with that email doesn't exists" });
    }
    const cards = user.cards;
    if (cards.length === 0) {
      return resp.status(200).json({ isEmpty: true });
    } else {
      resp.status(200).json({ isEmpty: false, cards: cards });
    }
  }
});

app.post("/getReviewcardlist", async (req, resp) => {
  const reviewid = req.body.reviewid;
  const userid = req.body.userid;

  const cardlist = await reviewcards.find({
    userid: userid,
    reviewid: reviewid
  });

  if (!cardlist) {
    return resp.status(401).json({ error: "No cards found" });
  } else {
    resp.status(200).json({ isEmpty: false, CardList: cardlist });
  }
});

app.post("/getcardlist", async (req, resp) => {
  const orderid = req.body.orderid;
  const user = await User.findOne({ userid: req.body.userid });

  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }
  //console.log( req.body.useridd, req.body.orderid )
  console.log(orderid);
  let getCards = user.cards.filter(cid => {
    if (orderid === cid.orderid) {
      return cid;
    }
  });

  const cards = getCards;

  if (cards.length === 0) {
    return resp.status(200).json({ isEmpty: true });
  } else {
    resp.status(200).json({ isEmpty: false, cards: cards });
  }
});

app.post("/getcarddetails/:_id/", async (req, resp) => {
  const _id = req.params._id;
  const user = await User.findOne({ userid: req.body.userid });

  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let card = user.cards.filter(card => {
    if (_id === card._id.toString()) {
      return card;
    }
  });
  card = card[0];
  if (card.length === 0) {
    return resp.status(200).json({ isEmpty: true });
  } else {
    resp.status(200).json({ isEmpty: false, cards: card });
  }
});

app.delete("/dltCards/:id", async (req, resp) => {
  const cardid = req.params.id;
  const userid = req.body.userid;
  const getuser = await User.findOne({ userid });
  const dltuser = getuser.cards.filter(cards => {
    if (cards._id.toString() !== cardid) {
      return cards;
    }
  });

  getuser.cards = dltuser;
  getuser.save();
  resp.send(getuser);
});

app.patch("/updatePSASUB", async (req, resp) => {
  const { _id, userid, PSASub, orderstatus } = req.body;
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": _id },
    {
      $set: {
        "orders.$.PSASub": PSASub,
        "orders.$.orderStatus": orderstatus
      }
    },
    { new: true }
  );

  resp.status(200).json(newUser);
});

app.patch("/updatecard/:id/", async (req, resp) => {
  const cardid = req.params.id;

  const {
    userid,
    qty,
    brand,
    cardyear,
    playername,
    attribute,
    totalDV,
    cardnumber
  } = req.body;

  const newUser = await User.findOneAndUpdate(
    { "cards._id": cardid },
    {
      $set: {
        "cards.$.qty": qty,
        "cards.$.cardyear": cardyear,
        "cards.$.cardnumber": cardnumber,
        "cards.$.playername": playername,
        "cards.$.attribute": attribute,
        "cards.$.totalDV": totalDV,
        "cards.$.brand": brand
      }
    },
    { new: true }
  );

  resp.status(200).json(newUser);
});

app.patch("/updateorderfinal/:orderid", async (req, resp) => {
  const orderid = req.params.orderid;
  const { userid, insuranceammount, textalert } = req.body;
  //console.log("I love you");
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid, "orders.userid": userid },
    {
      $set: {
        "orders.$.insuranceammount": insuranceammount,
        "orders.$.textmessagealert": textalert,
        "orders.$.isordercomplete": true
      }
    },
    { new: true }
  );

  // console.log(newUser);

  resp.status(200).json(newUser);
});

app.patch("/updateOrderFromAdmin/:orderid", async (req, resp) => {
  const orderid = req.params.orderid;
  const {
    userid,
    SGCphotoid,
    NonLoggedCardCount,
    LoggedCardCount,
    cardsaverqty,
    cardsaverprice,
    PSAUpcharge,
    servicelevel,
    orderStatus,
    insuranceammount,
    Percardpriceofnonloggedcard,
    NumberOfKicksfromservicelevel,
    Kicksfromreview,
    NumberofReviewPasses,
    PassesPrice
  } = req.body;
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid, "orders.userid": userid },
    {
      $set: {
        "orders.$.SGCphotoid": SGCphotoid,
        "orders.$.NonLoggedCardCount": NonLoggedCardCount,
        "orders.$.LoggedCardCount": LoggedCardCount,
        "orders.$.cardsaverqty": cardsaverqty,
        "orders.$.cardsaverprice": cardsaverprice,
        "orders.$.PSAUpcharge": PSAUpcharge,
        "orders.$.servicelevel": servicelevel,
        "orders.$.orderStatus": orderStatus,
        "orders.$.insuranceammount": insuranceammount,
        "orders.$.Percardpriceofnonloggedcard": Percardpriceofnonloggedcard,
        "orders.$.NumberOfKicksfromservicelevel": NumberOfKicksfromservicelevel,
        "orders.$.Kicksfromreview": Kicksfromreview,
        "orders.$.NumberofReviewPasses": NumberofReviewPasses,
        "orders.$.PassesPrice": PassesPrice
      }
    },
    { new: true }
  );

  resp.status(200).json(newUser);
});

app.post("/emailsend", async (req, resp) => {
  if (req.body.email) {
    let data = await User.findOne({ email: req.body.email });
    const responseType = {};

    if (data) {
      let otpcode = Math.floor(Math.random() * 10000 + 25);

      let otpData = new OTP({
        email: req.body.email,
        otp: otpcode,
        expirein: new Date().getTime() + 300 * 1000
      });
      let otpResponse = await otpData.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "gupta.shubhanshu007@gmail.com",
          pass: "bjzvvlumhuimipwq"
        }
      });

      let message = {
        from: "gupta.shubhanshu007@gmail.com",
        to: req.body.email,
        subject: "Verify OTP Mail",
        text: "Verify Your OTP With Nashcard and Your OTP Is: " + otpcode + "."
      };

      transporter.sendMail(message, function(error, info) {
        if (error) {
          resp.status(500).json("Email sent: " + info.response);
        } else {
          console.log("Email sent: " + info.response);
          resp.status(200).json("Email sent: " + info.response);
          // do something useful
        }
      });
    } else {
      resp.status(500).json("Email Error: Email Not Found");
    }
  }
});

app.post("/changepassword", async (req, resp) => {
  const email = req.body.email;
  const Otp = req.body.Otp;
  const password = req.body.newPassword;
  let data = await otp.find({
    email: email,
    Otp: Otp
  });

  let responseType = "";

  if (data) {
    let currentTime = new Date().getTime();
    let diff = data.expirein - currentTime;
    if (diff < 0) {
      responseType.message = "Token Expire";
      responseType.status = "Error";
    } else {
      let user = await User.findOne({ email: email });
      user.password = password;
      user.save();
      resp.send({ user: "password has been changed" });
    }
  } else {
    resp.send({ user: "Enter Valid password" });
  }
});

app.patch("/updateOrderStaus", async (req, resp) => {
  const { orderid, orderStatus } = req.body;

  let user = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    {
      $set: {
        "orders.$.orderStatus": orderStatus
      }
    },
    { new: true }
  );
  resp.send({ user: "Order Has been updated" });
  // console.log(newUser);
});

app.post("/filterGradeList", async (req, resp) => {
  let cert = req.body.cert;
  let orderid = req.body.orderid;
  let subid = req.body.subid;
  let user, length, finalList, NewfinalLIst;
  let allGrades = [];
  //step -1 to check subid
  if (subid) {
    user = await User.find({
      "orders.PSASub": subid
    }).select("orders");
    length = user.length;
  }

  if (length > 0) {
    user.forEach(Nuser => {
      Nuser.orders.forEach(Norder => {
        Norder.grades.forEach(Ngrade => {
          allGrades.push(Ngrade);
        });
      });
    });

    if (orderid) {
      finalList = allGrades.filter(Lorderid => {
        if (Lorderid.orderid === orderid) {
          return Lorderid;
        }
      });
      if (finalList.length > 0) {
        allGrades = [];
        allGrades.push(...finalList);
        length = 0;
      }
    }

    if (cert) {
      NewfinalLIst = allGrades.filter(Lcer => {
        if (Lcer.cert === cert) {
          return Lcer;
        }
      });
      allGrades = [];
      allGrades.push(...NewfinalLIst);
      resp.status(200).json({ allGrades });
    }
  }

  //step -2 to check subid is null and orderid has value
  // if (length === 0 && orderid) {
  //   user = await User.find({
  //     "orders.orderid": orderid
  //   });
  //   length = user.length;
  // }

  //step3 to check orderid is null and grade.cert has value

  // if (length === 0 && cert) {
  //   user = await User.find({
  //     "orders.grades.cert": cert
  //   });
  //   length = user.length;
  // }

  // if (length === 0) {
  //   resp
  //     .status(400)
  //     .json({ length: length, errorMsg: "Gardes not found for this search" });
  // }

  // user.forEach(Nuser => {
  //   Nuser.orders.forEach(Norder => {
  //     Norder.grades.forEach(Ngrade => {
  //       allGrades.push(Ngrade);
  //     });
  //   });
  // });

  // let finalList = allGrades.filter(cer => {
  //   if (cer.cert === cert) {
  //     return cer;
  //   }
  // });
});

app.post("/gradelistbyuserid", async (req, resp) => {
  const { userid, orderid } = req.body;
  let user = await User.find({ userid: userid }).select("orders");
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that userid doesn't exists" });
  }

  let allGrades = [];
  let PSASub = "";
  user.forEach(Nuser => {
    Nuser.orders.forEach(Norder => {
      PSASub = Norder.PSASub;
      Norder.grades.forEach(Ngrade => {
        allGrades.push(Ngrade);
      });
    });
  });

  let grdeLength = allGrades.length;

  if (!allGrades) {
    return resp.status(401).json({ error: "No Grades Found" });
  }
  resp
    .status(200)
    .json({ PSASub: PSASub, Grdercount: grdeLength, Grades: allGrades });
});

app.post("/allgradelist", async (req, resp) => {
  const datefilter = req.body.datefilter;
  let startdate = moment().format();
  let endDate = moment().format();
  let user;
  if (datefilter) {
    user = await User.find({
      "orders.$.grades.$.gradeDate": startdate
    }).select("orders");
    // console.log(datefilter);
  } else {
    user = await User.find().select("orders");
  }

  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }
  let allGrades = [];
  let orderstatus = [];
  user.forEach(Nuser => {
    Nuser.orders.forEach(Norder => {
      orderstatus = Norder.orderStatus;
      Norder.grades.forEach(Ngrade => {
        allGrades.push(Ngrade);
      });
    });
  });

  if (!allGrades) {
    return resp.status(401).json({ error: "No Grades Found" });
  }
  resp.status(200).json({ status: orderstatus, Grades: allGrades });

  //resp.status(200).json({ allGrades });
});

app.post("/addgrade", async (req, resp) => {
  const {
    orderid,
    userid,
    cert,
    grade,
    description,
    PSAsub,
    PSAUpchargeAmmount,
    frontImage,
    backimage,
    poppedDate
  } = req.body;

  let newdate = moment(poppedDate);

  const user = await User.findOne({ "orders.orderid": orderid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let orderFound = user.orders.filter(order => {
    if (order.orderid === orderid) {
      return order;
    }
  });
  orderFound = orderFound[0].toObject();
  if (!orderFound) {
    return resp
      .status(401)
      .json({ error: "order with that id does not exists" });
  }

  const orderGrade = {
    orderid: orderid,
    cert: cert,
    grade: grade,
    description: description,
    poppedDate: newdate,
    PSAsub: PSAsub,
    PSAUpchargeAmmount: PSAUpchargeAmmount,
    frontImage: frontImage,
    backimage: backimage
  };

  orderFound.grades.push(orderGrade);

  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    { $set: { "orders.$": orderFound } },
    { new: true }
  );
  resp.status(200).json(newUser);
});

app.post("/addnotes", async (req, resp) => {
  const { userid, orderid, notes } = req.body;
  const user = await User.findOne({ userid: userid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }
  let orderFound = user.orders.filter(order => {
    if (order.orderid === orderid) {
      return order;
    }
  });
  orderFound = orderFound[0].toObject();
  if (!orderFound) {
    return resp
      .status(401)
      .json({ error: "order with that id does not exists" });
  }
  const orderNote = {
    noteid: Math.floor(Math.random() * 10000),
    adminid: Math.floor(Math.random() * 1000000),
    notes: notes
  };
  orderFound.ordernotes.push(orderNote);
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid, userid: userid },
    { $set: { "orders.$": orderFound } },
    { new: true }
  );
  resp.status(200).json(newUser);
});

app.delete("/deleteGrade", async (req, resp) => {
  const { userid, orderid, _id } = req.body;

  const user = await User.findOne({ userid: userid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let orderFound = user.orders.filter(order => {
    if (order.orderid === orderid) {
      return order;
    }
  });
  orderFound = orderFound[0];

  if (!orderFound) {
    return resp
      .status(401)
      .json({ error: "order with that id does not exists" });
  }
  let orderGrades = orderFound.grades.filter(grade => {
    if (grade._id != _id) {
      //console.log(grade._id);
      return grade;
    }
  });

  orderFound.grades = orderGrades;
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    { $set: { "orders.$": orderFound } },
    { new: true }
  );
  resp.status(200).json(user);
});

app.delete("/deletenote", async (req, resp) => {
  const { userid, orderid, noteid } = req.body;
  const user = await User.findOne({ userid: userid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }
  let orderFound = user.orders.filter(order => {
    if (order.orderid === orderid) {
      return order;
    }
  });

  orderFound = orderFound[0].toObject();

  if (!orderFound) {
    return resp
      .status(401)
      .json({ error: "order with that id does not exists" });
  }
  let ordernotes = orderFound.ordernotes.filter(note => {
    if (note.noteid !== noteid) {
      return note;
    }
  });
  orderFound.ordernotes = ordernotes;
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    { $set: { "orders.$": orderFound } },
    { new: true }
  );
  resp.status(200).json(newUser);
});

app.post("/addservicelevel", async (req, resp) => {
  let newservicelevel = new servicelevel(req.body);
  let result = await newservicelevel.save();
  result = result.toObject();
  resp.send(result);
});

app.post("/getorderdetails", async (req, resp) => {
  let orderdetails = await User.findOne({
    userid: req.body.userid
  });
  if (orderdetails) {
    resp.send(orderdetails);
  } else {
    resp.send({ orderdetails: "No Record Found" });
  }
});

app.post("/profilechangepassword", async (req, resp) => {
  console.log(req.body.email);
  let user = await User.findOne({
    email: req.body.email
  });
  user.password = req.body.password;
  user.save();
  resp.send({ user: "password has been changed" });
});

app.post("/submitreview", async (req, resp) => {
  let newreview = new reviews(req.body);
  let result = await newreview.save();
  result = result.toObject();
  resp.send(result);
});

app.post("/getCompleteReviewList", async (req, resp) => {
  let reviewlist = await reviews.find({});
  if (reviewlist) {
    resp.send(reviewlist);
  } else {
    resp.send({ reviewlist: "No Review Found" });
  }
});

app.post("/getreviewlist", async (req, resp) => {
  let reviewlist = await reviews.find({
    userid: req.body.userid
  });
  if (reviewlist) {
    resp.send(reviewlist);
  } else {
    resp.send({ reviewlist: "No Review Found" });
  }
});

app.post("/addhelp", async (req, resp) => {
  let newhelp = new uhelp(req.body);
  let result = await newhelp.save();
  result = result.toObject();
  resp.send(result);
});

app.post("/registerNewUser", async (req, resp) => {
  let newUser = new emp(req.body);
  let result = await newUser.save();
  result = result.toObject();
  resp.send(result);
});

app.post("/getEmpList", async (req, resp) => {
  let result = await emp.find({});
  resp.send(result);
});

app.post("/gethelplist", async (req, resp) => {
  let helplist = await uhelp.find({
    userid: req.body.userid
  });
  if (helplist) {
    resp.send(helplist);
  } else {
    resp.send({ helplist: "No Record Found" });
  }
});

app.post("/getorderlist", async (req, resp) => {
  let user = await User.find({
    userid: req.body.userid
  }).select("-cards");

  const orders = user.orders;
  // if (orders.length === 0) {
  //   return resp.status(200).json({ isEmpty: true });
  // } else {
  //   resp.status(200).json({ isEmpty: false, orders: orders });
  // }
});

app.get("/getadminorderlist", async (req, resp) => {
  let user = await User.find({ "orders.cardcount": { $gt: 0 } }).exec();
  if (user) {
    resp.send(user);
  } else {
    resp.send({ user: "Record Not Found" });
  }
});

app.post("/getadminfilterorderlist", async (req, resp) => {
  const status = req.body.orderStatus;

  let user = await User.find({
    "orders.orderStatus": status
  }).exec();
  if (user) {
    resp.send(user);
  } else {
    resp.send({ user: "No Record Found" });
  }
});

app.post("/getGradingListbyorderid", async (req, resp) => {
  const orderid = req.body.orderid;
  let collection = [];
  collection = await User.find();

  collection
    .filter({
      orders: {
        grades: {
          $elemMatch: {
            orderid: orderid
          }
        }
      }
    })
    .toArray();
  resp.status(200).json({ isEmpty: false, orders: orders });
});

app.post("/getOrderAndCardDetails/:uid", async (req, resp) => {
  const userid = req.params.uid;
  const orderid = req.body.orderid;
  let user = await User.findOne({
    userid: userid
  });

  let orders = user.orders;

  orders = user.orders.filter(orders => {
    if (orderid === orders.orderid.toString()) {
      return orders;
    }
  });

  if (orders) {
    resp.send(orders);
  } else {
    resp.send({ orders: "Record Not Found" });
  }
});

app.post("/orders/:id", async (req, res) => {
  const userid = req.params.id;

  const user = await User.findOne({ userid });
  if (!user) {
    return res
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  const orders = user.orders;

  if (orders.length === 0) {
    return res.status(200).json({ isEmpty: true });
  }
  res.status(200).json({ isEmpty: false, orders: orders });
});

app.post("/ordernotelist/:id", async (req, res) => {
  const userid = req.params.id;
  const orderid = req.body.orderid;
  const user = await User.findOne({
    userid: userid
  });
  if (!user) {
    return res
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let order = user.orders.filter(order => {
    if (orderid === order.orderid.toString()) {
      return order;
    }
  });

  if (order.length === 0) {
    return res.status(500).json({ message: "No order found" });
  }
  const orderNotes = order[0].ordernotes;
  res.status(200).json({ isEmpty: false, orderNotes: orderNotes });
});

app.get("/getservicelevel/:name", async (req, resp) => {
  const name = req.params.name;
  let result = await servicelevel.find({ gradingcompany: name });
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "Record Not Found" });
  }
});

app.get("/getorderStatus/", async (req, resp) => {
  let result = await orderStatus.find();
  if (result) {
    resp.send(result);
  } else {
    resp.send({ result: "Record Not Found" });
  }
});

//Edit order page api

app.patch("/markorderpaid", async (req, resp) => {
  const { orderid, isorderpaid } = req.body;
  console.log(orderid);
  console.log(isorderpaid);
  let user = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    {
      $set: {
        "orders.$.isorderpaid": isorderpaid
      }
    },
    { new: true }
  );
  resp.send({ user: "Order Has been updated" });
  // console.log(newUser);
});

app.post("/getOrderAndCustomerDetails/", async (req, resp) => {
  let orderid = req.body.orderid;
  let result = await User.findOne({ "orders.orderid": orderid });
  let userid = result.userid;

  let userResult = await User.findOne({ userid: userid });
  let username = userResult.name + userResult.lastname;
  let userEmail = userResult.email;
  let userContact = userResult.contact;
  let orders = userResult.orders;
  let totalcards = userResult.cards.length;
  let ordercount = userResult.orders.length;
  resp.send({
    isEmpty: false,
    username: username,
    userEmail: userEmail,
    userContact: userContact,
    totalcards: totalcards,
    ordercount: ordercount,
    orders: orders
  });
});

app.patch("/updateOrderStatus", async (req, resp) => {
  const { _id, orderStatus, mailId, uemail } = req.body;
  let { mailsubject, mailtext } = "";

  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": _id },
    {
      $set: {
        "orders.$.orderStatus": orderStatus
      }
    },
    { new: true }
  );

  if (newUser) {
    if (mailId === 1) {
      //condition to set Ordr Status : "Card Logged"
      mailsubject = "Order No: " + _id + " has been sent to Grading Company";
      mailtext =
        "Order Update! Good news!, We Sent Your Cards to the Grading Company. Thanks again for sendings us and trusting us with your cards. We just sent your cards off for grading! Next up, we'll let you know when they receive them and the clock begins on getting you your grades! ";
    } else if (mailId === 2) {
      //condition to set Ordr Status : "Cards Reviewed by Nashcards"
      mailsubject = "Status Update: Order No" + _id + " has beeen Reviewed";
      mailtext = "Your Cards Have Been Reviewed within Order No: " + _id;
    }

    if (req.body.uemail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "gupta.shubhanshu007@gmail.com",
          pass: "bjzvvlumhuimipwq"
        }
      });

      let message = {
        from: "gupta.shubhanshu007@gmail.com",
        to: uemail,
        subject: mailsubject,
        text: mailtext
      };

      transporter.sendMail(message, function(error, info) {
        if (error) {
          resp.status(500).json("Email sent: " + info.response);
        } else {
          console.log("Email sent: " + info.response);
          resp.status(200).json("Email Status: " + info.response);
        }
      });
    } else {
      resp.status(500).json("Email Error: Email Not Found");
    }
  }

  resp.status(200).json(newUser);
});

app.post("/sendOrderStatusOnEmail", async (req, resp) => {
  let Orderid = req.body.orderId;
  let OrderStatus = req.body.OrderStatus;
  let mailid = req.body.mailId;
  let mailtext = "";
  let mailsubject = "";

  if (mailid === 1) {
    mailtext = "Order No: " + Orderid + " Status: " + OrderStatus;
    mailsubject = "Order Status Update With Nashcards";
  } else if (mailid === 2) {
    mailtext =
      "We have ready your Grades with your order no: " +
      Orderid +
      " Kindly pay your ammount and take your card back";
    mailsubject =
      "Reminder - Payment For Your Order id: " + Orderid + " With Nashcard";
  } else if (mailid === 3) {
    mailtext =
      "Order Id: " +
      Orderid +
      "Reminder Your Grades Are Popped For Order No: " +
      Orderid;
    mailsubject =
      "Reminder - Your Grades Popped For Your Order id: " +
      Orderid +
      " With Nashcard";
  } else if (mailid === 4) {
    mailtext =
      "This Receipt Mail Confirms We Received Your Cards With" +
      "Order Id: " +
      Orderid;
    mailsubject =
      "Receipt of Cards for Order id: " + Orderid + " With Nashcard";
  }

  if (req.body.uemail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gupta.shubhanshu007@gmail.com",
        pass: "bjzvvlumhuimipwq"
      }
    });

    let message = {
      from: "gupta.shubhanshu007@gmail.com",
      to: req.body.uemail,
      subject: mailsubject,
      text: mailtext
    };

    transporter.sendMail(message, function(error, info) {
      if (error) {
        resp.status(500).json("Email sent: " + info.response);
      } else {
        console.log("Email sent: " + info.response);
        resp.status(200).json("Email Status: " + info.response);
      }
    });
  } else {
    resp.status(500).json("Email Error: Email Not Found");
  }
});

app.post("/userUpload", (req, res) => {
  const csv = require("fast-csv");
  const fs = require("fs");
  const path = require("path");
  const filename = Date.now() + "_" + req.files.file.name;
  const file = req.files.file;
  console.log(filename, req.body.userid);
  let allUsers = [];
  let userData = { userid: req.body.userid, orderid: req.body.orderid };
  let i;
  let arrrowCount = 0;
  console.log(userData);
  let uploadPath = __dirname + "/uploads/" + filename;
  console.log(uploadPath);
  file.mv(uploadPath, err => {
    if (err) {
      return res.send(err);
    }
  });

  try {
    fs
      .createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", err => console.log(err))
      .on("data", row => {
        row["_id"] = new mongoose.Types.ObjectId();
        allUsers.push({ ...row });
      })
      .on("end", async rowCount => {
        for (i = 0; i <= rowCount; i++) {
          let r1 = new testProfile(allUsers[i]);
          let result = await r1.save();
        }
        arrrowCount = allUsers.length;
        res.status(200).json({ rowCount: arrrowCount });

        //user.files.push({ path: path.join(__dirname, "/uploads/", filename) });
        // r1.save();
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

app.post("/uploadGrades", (req, res) => {
  const csv = require("fast-csv");
  const fs = require("fs");
  const path = require("path");
  const filename = Date.now() + "_" + req.files.file.name;
  const file = req.files.file;

  let allGrades = [];
  let userData = { userid: req.body.userid, orderid: req.body.orderid };
  console.log(filename, userData.userid, userData.orderid);
  let uploadPath = __dirname + "/uploads/" + filename;
  file.mv(uploadPath, err => {
    if (err) {
      return res.send(err);
    }
  });

  try {
    fs
      .createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", err => console.log(err))
      .on("data", row => {
        allGrades.push({ ...userData, ...row });
      })
      .on("end", async rowCount => {
        const user = await User.findOne({
          userid: userData.userid
        }).select("orders");

        let orderFound = user.orders.filter(order => {
          if (order.orderid === userData.orderid) {
            return order;
          }
        });
        orderFound = orderFound[0];

        if (!orderFound) {
          return resp
            .status(401)
            .json({ error: "order with that id does not exists" });
        }

        let orderGrades = orderFound.grades;
        orderGrades.push(...allGrades);
        orderFound.grades = orderGrades;
        const newUser = await User.findOneAndUpdate(
          { "orders.orderid": userData.orderid },
          { $set: { "orders.$": orderFound } },
          { new: true }
        );
        //user.files.push({ path: path.join(__dirname, "/uploads/", filename) });
        //user.save();
        res.status(200).json({ user: newUser });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

app.post("/uploadReviewCards", (req, res) => {
  console.log("here");
  const csv = require("fast-csv");
  const fs = require("fs");
  const path = require("path");
  const filename = Date.now() + "_" + req.files.file.name;
  const file = req.files.file;
  console.log(filename, req.body.userid, req.body.reviewid);
  let allCards = [];
  let userData = { userid: req.body.userid, reviewid: req.body.reviewid };
  let uploadPath = __dirname + "/uploads/" + filename;
  file.mv(uploadPath, err => {
    if (err) {
      return res.send(err);
    }
  });
  console.log(uploadPath);
  try {
    fs
      .createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", err => console.log(err))
      .on("data", row => {
        allCards.push({ ...userData, ...row });
      })
      .on("end", async rowCount => {
        //console.log( allCards );

        for (const card of allCards) {
          let r1 = new reviewcards(card);
          let result = await r1.save();
        }

        //user.files.push({ path: path.join(__dirname, "/uploads/", filename) });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }

  res.status(200).json({ message: "ok" });
});

app.post("/upload", (req, res) => {
  const csv = require("fast-csv");
  const fs = require("fs");
  const path = require("path");
  const filename = Date.now() + "_" + req.files.file.name;
  const file = req.files.file;
  console.log(filename, req.body.userid, req.body.orderid);
  let allCards = [];
  let userData = { userid: req.body.userid, orderid: req.body.orderid };
  let uploadPath = __dirname + "/uploads/" + filename;
  file.mv(uploadPath, err => {
    if (err) {
      return res.send(err);
    }
  });

  try {
    fs
      .createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", err => console.log(err))
      .on("data", row => {
        allCards.push({ ...userData, ...row });
      })
      .on("end", async rowCount => {
        const user = await User.findOne({ userid: userData.userid });
        user.cards.push(...allCards);
        console.log(user);
        //user.files.push({ path: path.join(__dirname, "/uploads/", filename) });
        user.save();
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }

  res.status(200).json({ message: "ok" });
});

app.post("/upload-grades", async (req, res) => {
  //Grades
  const csv = require("fast-csv");
  const fs = require("fs");
  const path = require("path");
  const filename = Date.now() + "_" + req.files.file.name;
  const file = req.files.file;
  let allGrades = [];
  let uploadPath = __dirname + "/uploads/" + filename;
  file.mv(uploadPath, err => {
    if (err) {
      return res.send(err);
    }
  });
  try {
    console.log(uploadPath);
    fs
      .createReadStream(uploadPath)
      .pipe(
        csv.parse({
          headers: [
            "ordernumber",
            "psasub",
            "cert",
            "grade",
            "description",
            "card"
          ],
          ignoreHeaders: true
        })
      )
      .on("error", err => console.log(err))
      .on("data", row => {
        console.log(row, "row");
        allGrades.push({ ...row });
      })
      .on("end", async rowCount => {
        // console.log(allGrades, "allGrades");
        let newGrades = allGrades.filter(
          grade => grade.ordernumber !== "ordernumber"
        );
        for (const grade of newGrades) {
          let r1 = new Grades(grade);
          let result = await r1.save();
          console.log(result);
        }
        // console.log(newGrades, "newGrades");
        // for (var i = 1; i <= rowCount; i++) {
        //   let r1 = new Grades(allGrades[i]);

        // }
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
  res.status(200).json({ message: "ok" });
});
//order status with grades fields
app.post("/get-uploaded-grades", async (req, res) => {
  try {
    const autocompleteData = await User.aggregate([
      {
        $lookup: {
          from: "grades",
          localField: "orders.orderid",
          foreignField: "ordernumber",
          as: "result"
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $unwind: {
          path: "$result"
        }
      },
      {
        $project: {
          _id: "$result._id",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          orderid: "$orders.orderid",
          servicelevel: "$orders.servicelevel",
          status: "$result.status",
          email: 1,
          sgcphoto: "$orders.SGCphotoid",
          psasub: "$result.psasub",
          userid: 1,
          grname: "$orders.grcompanyname",
          qty: "$orders.cardcount",
          ordertotal: {
            $add: [
              {
                $multiply: ["$orders.cardcount", "$orders.pricepercard"]
              },
              "$orders.insuranceammount"
            ]
          }
        }
      }
    ]);
    return res.status(200).json(autocompleteData);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-uploaded-grades-for-mail", async (req, res) => {
  try {
    const autocompleteData = await User.aggregate([
      {
        $lookup: {
          from: "grades",
          localField: "orders.orderid",
          foreignField: "ordernumber",
          as: "result"
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $unwind: {
          path: "$result"
        }
      },
      {
        $project: {
          _id: "$result._id",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          orderid: "$orders.orderid",
          status: "$result.status",
          email: 1,
          userid: 1
        }
      }
    ]);
    const uniqueEmails = [...new Set(autocompleteData.map(item => item.email))];
    // const uniqueEmails = ['umarakmal71@gmail.com','conser.in3@gmail.com']
    //For mail
    if (uniqueEmails) {
      for (var i = 0; i < uniqueEmails.length; i++) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "gupta.shubhanshu007@gmail.com",
            pass: "bjzvvlumhuimipwq"
          }
        });

        let message = {
          from: "gupta.shubhanshu007@gmail.com",
          to: uniqueEmails[i],
          subject: "Nashcard: YourGgardes Are Ready.",
          text: "Hi, Your grades are now ready for Order No:  4849 "
        };

        transporter.sendMail(message, function(error, info) {
          if (error) {
            res.status(500).json("Email sent: " + info.response);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    }
    //
    return res.status(200).json(uniqueEmails);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/order-autocomplete", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const autocompleteData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: 0,
          orderid: "$orders.orderid"
        }
      }
    ]);
    return res.status(200).json(autocompleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/order-search", async (req, res) => {
  try {
    const cert = req.body.cert;
    const orderid = req.body.orderid;
    const PSASub = req.body.PSASub;
    if (!cert && !orderid && !PSASub) {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    } else if (!cert && !PSASub) {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        },
        {
          $match: {
            orderid: orderid
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    } else if (!PSASub && !orderid) {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        },
        {
          $match: {
            cert: cert
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    } else if (!cert && !orderid) {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        },
        {
          $match: {
            PSASub: PSASub
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    } else if (cert && PSASub) {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        },
        {
          $match: {
            PSASub: parseInt(PSASub),
            cert: cert
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    } else if (cert && orderid) {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        },
        {
          $match: {
            orderid: orderid,
            cert: cert
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    } else {
      const autocompleteData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$orders.grades"
          }
        },
        {
          $project: {
            _id: "$orders.grades._id",
            orderid: "$orders.grades.orderid",
            cert: "$orders.grades.cert",
            grade: "$orders.grades.grade",
            description: "$orders.grades.description",
            PSASub: "$orders.grades.PSAsub",
            poppedDate: "$orders.grades.poppedDate",
            PSAUpchargeAmmount: "$orders.grades.PSAUpchargeAmmount",
            status: "$orders.orderStatus",
            frontImage: "$orders.grades.frontImage",
            backimage: "$orders.grades.backimage"
          }
        },
        {
          $match: {
            cert: cert,
            orderid: orderid,
            PSASub: PSASub
          }
        }
      ]);
      return res.status(200).json(autocompleteData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//order status with grades fields
app.post("/order-status", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const autocompleteData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": { $ne: "Quality And Assurance" }
        }
      },
      {
        $unwind: {
          path: "$orders.grades"
        }
      },
      {
        $project: {
          orderStatus: "$orders.orderStatus",
          orderid: "$orders.grades.orderid",
          cert: "$orders.grades.cert",
          grade: "$orders.grades.grade",
          description: "$orders.grades.description",
          PSASub: "$orders.grades.PSAsub",
          poppedDate: "$orders.grades.poppedDate",
          PSAUpchargeAmount: "$orders.grades.PSAUpchargeAmmount",
          frontImage: "$orders.grades.frontImage",
          backimmage: "$orders.grades.backimage",
          _id: "$orders.grades._id"
        }
      }
    ]);
    return res.status(200).json(autocompleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/order-search-service-tracking", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const servicelevel = req.body.servicelevel;
    if (servicelevel) {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $match: {
            "orders.servicelevel": servicelevel
          }
        },
        {
          $project: {
            name: {
              $concat: ["$name", " ", "$lastname"]
            },
            orderid: "$orders.orderid",
            serviceLevel: "$orders.servicelevel",
            status: "$orders.orderStatus",
            cardQty: "$orders.cardcount",
            cardRecievedDate: "$orders.CardrecivedDate",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    } else {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $project: {
            name: {
              $concat: ["$name", " ", "$lastname"]
            },
            orderid: "$orders.orderid",
            serviceLevel: "$orders.servicelevel",
            status: "$orders.orderStatus",
            cardQty: "$orders.cardcount",
            cardRecievedDate: "$orders.CardrecivedDate",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/search-psa-orders", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const psasub = parseInt(req.body.psasub);
    if (psasub) {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $match: {
            "orders.PSASub": parseInt(psasub)
          }
        },
        {
          $project: {
            psasub: "$orders.PSASub",
            orderid: "$orders.orderid",
            serviceLevel: "$orders.servicelevel",
            status: "$orders.orderStatus",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    } else {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $project: {
            psasub: "$orders.PSASub",
            orderid: "$orders.orderid",
            serviceLevel: "$orders.servicelevel",
            status: "$orders.orderStatus",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//order status with grades fields
app.post("/updated-order-status", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const searchData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": "Quality And Assurance"
        }
      },
      {
        $project: {
          userid: "$userid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          _id: 1,
          orderid: "$orders.orderid",
          serviceLevel: "$orders.servicelevel",
          status: "$orders.orderStatus",
          cardQty: "$orders.cardcount",
          psasub: "$orders.PSASub",
          grcompanyname: "$orders.grcompanyname",
          orderTotal: {
            $add: [
              {
                $multiply: ["$orders.cardcount", "$orders.pricepercard"]
              },
              "$orders.insuranceammount"
            ]
          }
        }
      }
    ]);
    return res.status(200).json(searchData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//order status with grades fields
app.post("/card-tracking-search", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const searchData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $unwind: {
          path: "$cards"
        }
      },
      {
        $project: {
          _id: "$cards._id",
          orderid: "$cards.orderid",
          serviceLevel: "$orders.servicelevel",
          status: "$orders.orderStatus",
          cardQty: "$cards.qty",
          psasub: "$orders.PSASub",
          dv: "$cards.totalDV",
          dateCreated: "$orders.createdate",
          ordername: {
            $concat: ["$name", " ", "$lastname"]
          }
        }
      }
    ]);
    return res.status(200).json(searchData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/card-search", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const { orderid, psasub } = req.body;
    if (orderid) {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $match: {
            "orders.orderid": orderid
          }
        },
        {
          $unwind: {
            path: "$cards"
          }
        },
        {
          $project: {
            _id: "$cards._id",
            orderid: "$cards.orderid",
            serviceLevel: "$orders.servicelevel",
            cardQty: "$cards.qty",
            psasub: "$orders.PSASub",
            dv: "$cards.totalDV",
            ordername: "$cards.playername",
            cardyear: "$cards.cardyear",
            brand: "$cards.brand",
            cardnumber: "$cards.cardnumber",
            playername: "$cards.playername",
            attribute: "$cards.attribute",
            price: "$orders.pricepercard",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    } else if (psasub) {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $match: {
            "orders.PSASub": parseInt(psasub)
          }
        },
        {
          $unwind: {
            path: "$cards"
          }
        },
        {
          $project: {
            _id: "$cards._id",
            orderid: "$cards.orderid",
            serviceLevel: "$orders.servicelevel",
            cardQty: "$cards.qty",
            psasub: "$orders.PSASub",
            dv: "$cards.totalDV",
            ordername: "$cards.playername",
            cardyear: "$cards.cardyear",
            brand: "$cards.brand",
            cardnumber: "$cards.cardnumber",
            playername: "$cards.playername",
            attribute: "$cards.attribute",
            price: "$orders.pricepercard",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    } else if (psasub && orderid) {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $match: {
            "orders.PSASub": parseInt(psasub),
            "orders.orderid": orderid
          }
        },
        {
          $unwind: {
            path: "$cards"
          }
        },
        {
          $project: {
            _id: "$cards._id",
            orderid: "$cards.orderid",
            serviceLevel: "$orders.servicelevel",
            cardQty: "$cards.qty",
            psasub: "$orders.PSASub",
            dv: "$cards.totalDV",
            ordername: "$cards.playername",
            cardyear: "$cards.cardyear",
            brand: "$cards.brand",
            cardnumber: "$cards.cardnumber",
            playername: "$cards.playername",
            attribute: "$cards.attribute",
            price: "$orders.pricepercard",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    } else {
      const searchData = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $unwind: {
            path: "$cards"
          }
        },
        {
          $project: {
            _id: "$cards._id",
            orderid: "$cards.orderid",
            serviceLevel: "$orders.servicelevel",
            status: "$orders.orderStatus",
            cardQty: "$cards.qty",
            psasub: "$orders.PSASub",
            dv: "$cards.totalDV",
            dateCreated: "$orders.createdate",
            ordername: "$cards.playername",
            cardyear: "$cards.cardyear",
            brand: "$cards.brand",
            cardnumber: "$cards.cardnumber",
            playername: "$cards.playername",
            attribute: "$cards.attribute",
            price: "$orders.pricepercard",
            gradingcompany: "$orders.grcompanyname",
            userid: 1,
            orderTotal: {
              $add: [
                {
                  $multiply: ["$orders.cardcount", "$orders.pricepercard"]
                },
                "$orders.insuranceammount"
              ]
            }
          }
        }
      ]);
      return res.status(200).json(searchData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/service-level-tracking-order-autocomplete", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const autocompleteData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: 0,
          orderid: "$orders.servicelevel"
        }
      }
    ]);
    return res.status(200).json(autocompleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-data-service-tracking", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const searchData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          orderid: "$orders.orderid",
          serviceLevel: "$orders.servicelevel",
          status: "$orders.orderStatus",
          totalcardQty: "$orders.cardcount",
          cardRecievedDate: "$orders.CardrecivedDate",
          gradingcompany: "$orders.grcompanyname",
          userid: 1,
          orderTotal: {
            $add: [
              {
                $multiply: ["$orders.cardcount", "$orders.pricepercard"]
              },
              "$orders.insuranceammount"
            ]
          }
        }
      }
    ]);
    return res.status(200).json(searchData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-data-customers", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const searchCustomers = await User.aggregate([
      {
        $project: {
          _id: 1,
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          email: 1,
          userid: 1
        }
      }
    ]);
    return res.status(200).json(searchCustomers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/search-customers-address", async (req, res) => {
  try {
    const addressSearch = req.body.addressSearch;
    // Fetch data from the database based on the input
    const searchCustomers = await User.aggregate([
      {
        $match: {
          $or: [
            {
              address: {
                $regex: addressSearch,
                $options: "i"
              }
            },
            {
              city: {
                $regex: addressSearch,
                $options: "i"
              }
            },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $toString: "$pincode"
                  },
                  regex: addressSearch
                }
              }
            },
            {
              state: {
                $regex: addressSearch,
                $options: "i"
              }
            }
          ]
        }
      },
      {
        $addFields: {
          pincode: {
            $toString: "$pincode"
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          email: 1,
          address: {
            $concat: ["$address", ",", "$city", ",", "$state", ",", "$pincode"]
          },
          contact: 1
        }
      }
    ]);
    return res.status(200).json(searchCustomers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/psasub-autocomplete", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const autocompleteData = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $addFields: {
          psasub: { $toString: "$orders.PSASub" }
        }
      },
      {
        $project: {
          _id: 0,
          orderid: "$psasub"
        }
      }
    ]);
    return res.status(200).json(autocompleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/customer-user-details", async (req, res) => {
  try {
    const id = req.body.id;
    // Fetch data from the database based on the input
    const autocompleteData = await User.aggregate([
      {
        $match: {
          _id: id
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: 0,
          orderid: "$psasub"
        }
      }
    ]);
    return res.status(200).json(autocompleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/user-details-data-with-id", async (req, res) => {
  try {
    const userid = req.body.userid;
    // Fetch data from the database based on the input
    const userdetails = await User.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        }
      },
      {
        $addFields: {
          pincode: {
            $toString: "$pincode"
          }
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: 1,
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          email: 1,
          contact: 1,
          address: {
            $concat: ["$address", ",", "$city", ",", "$state", ",", "$pincode"]
          }
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/customers-unpaid-order", async (req, res) => {
  try {
    const userid = req.body.userid;
    // Fetch data from the database based on the input
    const userdetails = await User.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: 1,
          ordersTotal: "$orders.isorderpaid"
        }
      },
      {
        $group: {
          _id: null,
          ordersTotal: {
            $sum: 1
          },
          unpaidOrders: {
            $sum: {
              $cond: [
                {
                  $eq: ["$ordersTotal", false]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/customers-orders", async (req, res) => {
  try {
    const userid = req.body.userid;
    // Fetch data from the database based on the input
    const userdetails = await User.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          servicelevel: "$orders.servicelevel",
          status: "$orders.orderStatus",
          totalcards: "$orders.cardcount",
          orderTotal: {
            $add: [
              {
                $multiply: ["$orders.cardcount", "$orders.pricepercard"]
              },
              "$orders.insuranceammount"
            ]
          },
          paiddate: "$orders.paiddate",
          gradespoppedDate: "$orders.Gardespopdate",
          grcompanyname: "$orders.grcompanyname",
          userid: 1
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/orders-details-perid", async (req, res) => {
  try {
    const userid = req.body.userid;
    const orderid = req.body.orderid;

    // Fetch data from the database based on the input
    const userdetails = await User.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        } // 'orders._id':idperorder
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderid": orderid
        } // 'orders._id':idperorder
      },
      {
        $project: {
          _id: "$orders._id",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          email: 1,
          orderid: "$orders.orderid",
          servicelevel: "$orders.servicelevel",
          status: "$orders.orderStatus",
          totalcards: "$orders.cardcount",
          insuranceammount: "$orders.insuranceammount",
          orderTotal: {
            $multiply: ["$orders.cardcount", "$orders.pricepercard"]
          },
          localpickup: "$orders.localpickup",
          PSAUpcharge: "$orders.PSAUpcharge",
          pricepercard: "$orders.pricepercard",
          paiddate: "$orders.paiddate",
          NonLoggedCardCount: "$orders.NonLoggedCardCount",
          Percardpriceofnonloggedcard: "$orders.Percardpriceofnonloggedcard",
          NumberOfKicksfromservicelevel:
            "$orders.NumberOfKicksfromservicelevel",
          Kicksfromreview: "$orders.Kicksfromreview",
          NumberofReviewPasses: "$orders.NumberofReviewPasses",
          PassesPrice: "$orders.PassesPrice",
          gradespoppedDate: "$orders.Gardespopdate",
          grcompanyname: "$orders.grcompanyname",
          userid: 1
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/get-grades", async (req, res) => {
  try {
    const userid = req.body.userid;

    // Fetch data from the database based on the input
    const userdetails = await User.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        }
      },
      {
        $lookup: {
          from: "grades",
          localField: "orders.orderid",
          foreignField: "ordernumber",
          as: "result"
        }
      },
      {
        $unwind: {
          path: "$result"
        }
      },
      {
        $project: {
          _id: "$result._id",
          orderid: "$result.ordernumber",
          cert: "$result.cert",
          grade: "$result.grade",
          desc: "$result.Description",
          psaupcharge: "$result.psaupcharge",
          frontimage: "$result.frontimage",
          backimage: "$result.backimage",
          psasub: "$result.psasub",
          userid: 1
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-shipping", async (req, res) => {
  try {
    const psasub = req.body.psasub;
    if (psasub) {
      // Fetch data from the database based on the input
      const userdetails = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $match: {
            "orders.PSASub": parseInt(psasub)
          }
        },

        {
          $project: {
            _id: "$orders._id",
            totalcard: { $size: "$cards" },
            orderid: "$orders.orderid",
            psasub: "$orders.PSASub",
            userid: 1,
            grname: "$orders.grcompanyname"
          }
        }
      ]);
      return res.status(200).json(userdetails);
    } else {
      const userdetails = await User.aggregate([
        {
          $unwind: {
            path: "$orders"
          }
        },
        {
          $project: {
            _id: "$orders._id",
            totalcard: { $size: "$cards" },
            orderid: "$orders.orderid",
            psasub: "$orders.PSASub",
            userid: 1,
            grname: "$orders.grcompanyname"
          }
        }
      ]);
      return res.status(200).json(userdetails);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/review-orders", async (req, res) => {
  try {
    const userid = req.body.userid;
    // Fetch data from the database based on the input
    const userdetails = await ureviews.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        }
      },
      {
        $project: {
          _id: 1,
          reviewid: 1,
          status: 1
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-grades-for-edit", async (req, res) => {
  try {
    const orderid = req.body.orderid;
    // Fetch data from the database based on the input
    const userdetails = await Grades.aggregate([
      {
        $match: {
          ordernumber: orderid
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/order-notes", async (req, res) => {
  try {
    // Fetch data from the database based on the input
    const userdetails = await User.aggregate([
      {
        $lookup: {
          from: "employelogins",
          localField: "userid",
          foreignField: "adminid",
          as: "result"
        }
      },
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $unwind: {
          path: "$result"
        }
      },
      {
        $project: {
          orders: 1,
          ordernotes: "$orders.ordernotes",
          name: "$result.name"
        }
      },
      {
        $unwind: {
          path: "$ordernotes"
        }
      },
      {
        $project: {
          _id: "$ordernotes._id",
          name: "$name",
          ordernumber: "$orders.orderid",
          noteDate: "$ordernotes.notedate",
          ordernotes: "$ordernotes.notes"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-customer-updatedata", async (req, res) => {
  try {
    const userid = req.body.userid;
    const userdetails = await User.aggregate([
      {
        $match: {
          userid: parseInt(userid)
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          lastname: 1,
          address: 1,
          city: 1,
          pincode: 1,
          state: 1,
          email: 1,
          contact: 1
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/get-card-log", async (req, res) => {
  try {
    const cardLogs = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          orderid: "$orders.orderid",
          status: "$orders.orderStatus",
          servicelevel: "$orders.servicelevel",
          orderCreationDate: "$orders.createdate",
          userid: 1
        }
      },
      { $sort: { orderCreationDate: 1 } }
    ]);
    return res.status(200).json(cardLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/create-project", async (req, res) => {
  try {
    let projectDet = new project(req.body);
    let result = await projectDet.save();
    result = result.toObject();
    res.send(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/get-details-project", async (req, res) => {
  try {
    let result = await project.find();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.delete("/delete-project", async (req, res) => {
  try {
    const id = req.body.id;
    await project.findByIdAndRemove(id).then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete`
        });
      } else {
        res.send({
          message: "project was deleted successfully!"
        });
      }
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/get-project-with-id", async (req, res) => {
  try {
    const id = req.body.id;
    let result = await project.findById(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.patch("/updateproject", async (req, resp) => {
  const id = req.body.id;
  const projectTitle = req.body.projectTitle;
  const description = req.body.description;
  const status = req.body.status;
  const dueDate = req.body.dueDate;
  const assignedMember = req.body.assignedMember;
  let projectDet = await project.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        projectTitle: projectTitle,
        description: description,
        status: status,
        dueDate: dueDate,
        assignedMember: assignedMember
      }
    },
    { new: true }
  );
  resp.status(200).json({ proj: "Successfully Updated" });
});

app.patch("/update-grades", async (req, resp) => {
  const orderNo = req.body.orderNo;
  const cert = req.body.cert;
  const description = req.body.description;
  const grade = req.body.grade;
  const pSASub = req.body.pSASub;
  const datePooped = req.body.datePooped;
  const pSASubAmt = req.body.pSASubAmt;

  let projectDet = await Grades.findOneAndUpdate(
    { ordernumber: orderNo },
    {
      $set: {
        cert: cert,
        ordernumber: orderNo,
        Description: description,
        grade: grade,
        psasub: pSASub,
        datepopped: datePooped,
        psaupcharge: pSASubAmt
      }
    },
    { new: true }
  );
  resp.status(200).json({ proj: "Successfully Updated" });
});
app.post("/find-member", async (req, res) => {
  try {
    let result = await empLogin.find();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/get-order-await", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": "Awaiting Customer Pickup" //Awaiting Customer Pickup
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          paystatus: "paid/unpaid",
          servicelevel: "$orders.servicelevel",
          userid: 1,
          totalcards: "$orders.cardcount",
          status: "$orders.orderStatus",
          grname: "$orders.grcompanyname"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-order-pickup", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": "Picked Up" //Picked Up
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          servicelevel: "$orders.servicelevel",
          userid: 1,
          totalcards: "$orders.cardcount",
          status: "$orders.orderStatus",
          grname: "$orders.grcompanyname"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-order-request-return", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": "Requested Returns" //Requested Returns
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          servicelevel: "$orders.servicelevel",
          userid: 1,
          totalcards: "$orders.cardcount",
          status: "$orders.orderStatus",
          email: 1,
          grname: "$orders.grcompanyname"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-order-newly-paid", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        //Newly Paid
        $match: {
          "orders.orderStatus": "Newly Paid"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          servicelevel: "$orders.servicelevel",
          userid: 1,
          totalcards: "$orders.cardcount",
          status: "$orders.orderStatus",
          poppedDate: "$orders.Gardespopdate",
          paiddate: "$orders.paiddate",
          grname: "$orders.grcompanyname"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/markaspickedup", async (req, resp) => {
  const { orderid } = req.body;
  let user = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    {
      $set: {
        "orders.$.orderStatus": "Picked Up"
      }
    },
    { new: true }
  );
  resp.send({ user: "Order Has been updated" });
});
app.post("/get-sgc-photos", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          servicelevel: "$orders.servicelevel",
          userid: 1,
          psasub: "$orders.PSASub",
          SGCphotoid: "$orders.SGCphotoid"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-paid-orders", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": "Paid"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          servicelevel: "$orders.servicelevel",
          userid: 1,
          status: "$orders.orderStatus",
          poppedDate: "$orders.Gardespopdate",
          paiddate: "$orders.paiddate",
          grname: "$orders.grcompanyname",
          email: 1
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-review", async (req, res) => {
  try {
    const status = req.body.status;
    if (!status) {
      const userdetails = await ureviews.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "userid",
            as: "result"
          }
        },
        {
          $unwind: {
            path: "$result"
          }
        },
        {
          $project: {
            _id: 1,
            email: "$result.email",
            userid: "$result.userid",
            name: {
              $concat: ["$result.name", " ", "$result.lastname"]
            },
            reviewid: 1,
            companyname: 1,
            status: 1
          }
        }
      ]);
      return res.status(200).json(userdetails);
    } else {
      const userdetails = await ureviews.aggregate([
        {
          $match: {
            status: status
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userid",
            foreignField: "userid",
            as: "result"
          }
        },
        {
          $unwind: {
            path: "$result"
          }
        },
        {
          $project: {
            _id: 1,
            email: "$result.email",
            userid: "$result.userid",
            name: {
              $concat: ["$result.name", " ", "$result.lastname"]
            },
            reviewid: 1,
            companyname: 1,
            status: 1
          }
        }
      ]);
      return res.status(200).json(userdetails);
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.patch("/mark-as-shipped", async (req, resp) => {
  const { orderid } = req.body;
  let user = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    {
      $set: {
        "orders.$.orderStatus": "Shipped"
      }
    },
    { new: true }
  );
  resp.send({ user: "Order Has been updated" });
});

app.delete("/delete-review", async (req, res) => {
  try {
    const id = req.body.id;
    await ureviews.findByIdAndRemove(id).then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete`
        });
      } else {
        res.send({
          message: "review was deleted successfully!"
        });
      }
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/create-subnum", async (req, res) => {
  try {
    let psaNumDet = new psasubtracker(req.body);
    let result = await psaNumDet.save();
    result = result.toObject();
    res.send(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});
app.post("/create-review", async (req, res) => {
  try {
    let reviewData = new reviews(req.body);
    let result = await reviewData.save();
    result = result.toObject();
    res.send(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.post("/get-details-psasubtracker", async (req, res) => {
  try {
    let result = await psasubtracker.find();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
});

app.patch("/updatePsa-subtracker", async (req, resp) => {
  try {
    const psasubnum = req.body.subnumber;
    const headers = {
      Authorization:
        "Bearer efIjuZZweQdXDXL149ELi1S-npq7N4kyxTko1XaJB8SCPzKKUzyBCq3nvGc2c0KynQ_fAFG0MxnyiNc_kMc_sBBytzvCNyppnx4T2mdF8EXD_pNPKSXmYEiYmOT0S2a7hiI3-jRlfsLAWIcI_AU2LKFKQe373Ez5p0rgCEkBBgFts_8MK_L4HsMzaL-OVwleJkveLOhH6RFveOBrR_gE6saJ2KxBE3ImqsSZovOBAOrgT1pZhQxYFHFkjdg5gVo4E5xAalUd_hQhZelrc-2A-2_5eQNF265cAT-KpWCig-rty_UJ"
    };
    const response = await axios.get(
      `https://api.psacard.com/publicapi/order/GetSubmissionProgress/${psasubnum}`,
      { headers }
    );

    if ((await response.status) === 200) {
      const ordernumber = await response.data.orderNumber;
      const shipped = await response.data.shipped;
      const arrived = await response.data.orderProgressSteps[0].completed;
      const orderprep = await response.data.orderProgressSteps[1].completed;
      const researchandid = await response.data.orderProgressSteps[2].completed;
      const grading = await response.data.orderProgressSteps[3].completed;
      const gradespopped = await response.data.gradesReady;
      const assembly = await response.data.orderProgressSteps[4].completed;
      const qacheck1 = await response.data.orderProgressSteps[5].completed;
      const qacheck2 = await response.data.orderProgressSteps[6].completed;
      const trackingnumber = await response.data.shipTrackingNumber;

      let valPsaStatus = [];
      await response.data.orderProgressSteps.forEach(el => {
        if (el.completed === false) {
          valPsaStatus.push(el.step);
        } else {
        }
      });
      let psacurrentstatus;
      if (valPsaStatus.length > 0) {
        psacurrentstatus = valPsaStatus[0];
      } else {
        psacurrentstatus = "Completed";
      }

      let user = await psasubtracker.findOneAndUpdate(
        { subnumber: parseInt(psasubnum) },
        {
          $set: {
            ordernumber: parseInt(ordernumber),
            shipped: shipped,
            assembly: assembly,
            qacheck1: qacheck1,
            qacheck2: qacheck2,
            trackingnumber: trackingnumber,
            arrived: arrived,
            orderprep: orderprep,
            researchandid: researchandid,
            gradespopped: gradespopped,
            grading: grading,
            psacurrentstatus: psacurrentstatus
          }
        },
        { new: true }
      );
      resp.send({ data: "Information has been updated" });
    } else {
    }
  } catch (error) {
    return resp.status(500).json("error");
  }
});

app.post("/get-service-level", async (req, res) => {
  try {
    const servicedetails = await servicelevel.aggregate([
      {
        $project: {
          _id: 1,
          pricepercard: 1,
          servicelevel: 1
        }
      }
    ]);
    return res.status(200).json(servicedetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/get-status-order", async (req, res) => {
  try {
    const orderdetails = await orderStatus.find({});
    return res.status(200).json(orderdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-status-subtracker", async (req, res) => {
  try {
    const status = req.body.status;

    if (status) {
      if (status === "Hide Completed") {
        const userdetails = await psasubtracker.aggregate([
          {
            $match: {
              psacurrentstatus: { $ne: "Completed" }
            }
          },
          {
            $project: {
              _id: 1,
              subnumber: 1,
              creationdate: 1,
              psacurrentstatus: 1,
              gradespopped: 1,
              updatedAt: 1
            }
          }
        ]);
        return res.status(200).json(userdetails);
      } else {
        const userdetails = await psasubtracker.aggregate([
          {
            $match: {
              psacurrentstatus: status
            }
          },
          {
            $project: {
              _id: 1,
              subnumber: 1,
              creationdate: 1,
              psacurrentstatus: 1,
              gradespopped: 1,
              updatedAt: 1
            }
          }
        ]);
        return res.status(200).json(userdetails);
      }
    } else {
      const userdetails = await psasubtracker.aggregate([
        {
          $project: {
            _id: 1,
            subnumber: 1,
            creationdate: 1,
            psacurrentstatus: 1,
            gradespopped: 1,
            updatedAt: 1
          }
        }
      ]);
      return res.status(200).json(userdetails);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-psa-orders-for-subtracker", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderStatus": "Cards Sent to Grading Company"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          orderid: "$orders.orderid",
          psasubnumber: "$orders.PSASub",
          servicelevel: "$orders.servicelevel",
          userid: 1,
          cardssenttopsadate: "",
          cardrecievedbypsadate: "$orders.CardrecivedDate",
          status: "$orders.orderStatus",
          grname: "$orders.grcompanyname"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/get-orders-recieved", async (req, res) => {
  try {
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $project: {
          _id: "$orders._id",
          ordernumber: "$orders.orderid",
          psasubnumber: "$orders.PSASub",
          servicelevel: "$orders.servicelevel",
          userid: 1,
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          cardssenttopsadate: "",
          cardrecieveddate: "$orders.CardrecivedDate",
          status: "$orders.orderStatus",
          grname: "$orders.grcompanyname"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/get-orders-shipping", async (req, res) => {
  try {
    const psasub = req.body.psasub;
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.PSASub": parseInt(psasub)
        }
      },
      {
        $project: {
          grade: "$orders.grades",
          orderid: "$orders.orderid",
          psasub: "$orders.PSASub",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          status: "$orders.orderStatus",
          shippickup: "$orders.localpickup",
          location: {
            $concat: ["$city", ",", "$state"]
          }
        }
      },
      {
        $unwind: {
          path: "$grade"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/create-order", async (req, resp) => {
  const validuser = await User.findOne({ userid: req.body.userid });
  if (!validuser) {
    return resp
      .status(401)
      .json({ error: "user with that user id is not exist" });
  } else {
    const neworder = {
      orderid: req.body.orderid,
      orderType: req.body.orderType,
      servicelevel: req.body.servicelevel,
      grcompanyname: req.body.grcompanyname,
      cardcount: req.body.cardcount,
      localpickup: req.body.localpickup,
      totaldv: req.body.totaldv,
      insuranceammount: req.body.insuranceammount,
      pricepercard: req.body.pricepercard,
      calculatedtotalcard: req.body.calculatedtotalcard,
      isactive: true,
      caculatedinsurancecost: req.body.caculatedinsurancecost,
      TotalPrice: 0,
      ShippingFee: req.body.ShippingFee,
      textmessagealert: req.body.textmessagealert,
      userid: req.body.userid,
      isordercomplete: req.body.isordercomplete,
      orderStatus: req.body.orderStatus,
      SGCphotoid: req.body.SGCphotoid,
      NonLoggedCardCount: req.body.NonLoggedCardCount,
      LoggedCardCount: req.body.LoggedCardCount,
      cardsaverqty: req.body.cardsaverqty,
      cardsaverprice: req.body.cardsaverprice,
      PSASub: req.body.PSASub,
      PSAUpcharge: req.body.PSAUpcharge,
      CustomerCSV: req.body.CustomerCSV,
      DropoffLocation: req.body.DropoffLocation,
      paymentlink: req.body.paymentlink,
      autographcount: req.body.autographcount,
      isorderpaid: req.body.isorderpaid,
      NumberOfKicksfromservicelevel: 0,
      Kicksfromreview: 0,
      NumberofReviewPasses: 0,
      PassesPrice: 0,
      Percardpriceofnonloggedcard: 0,
      Gardespopdate: req.body.Gardespopdate,
      CardrecivedDate: req.body.CardrecivedDate,
      CardrecivedDate: req.body.CardrecivedDate,
      CustomerInvoicedDate: req.body.CustomerInvoicedDate,
      Orderconfirmed: false,
      ordernotes: [],
      grades: []
    };

    validuser.orders.push(neworder);
    validuser.save();
    resp.status(200).json(validuser);
  }
});

// Function to validate 'id'
function isValidId(id) {
  // Check if 'id' is a string of 12 bytes or 24 hex characters or an integer
  return (
    typeof id === "string" &&
    (id.length === 12 || id.length === 24) &&
    /^[0-9a-fA-F]+$/.test(id)
  );
}
// card with service level
app.post("/carddetails", async (req, res) => {
  try {
    const id = req.body.id;
    // Validate 'id' before creating the ObjectId
    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $unwind: {
          path: "$cards"
        }
      },
      {
        $match: {
          "cards._id": new ObjectId(id)
        }
      },
      {
        $match: {
          $expr: {
            $eq: ["$orders.orderid", "$cards.orderid"]
          }
        }
      },
      {
        $project: {
          _id: "$cards._id",
          servcelevel: "$orders.servicelevel",
          userid: 1,
          orderid: "$cards.orderid",
          attribute: "$cards.attribute",
          brand: "$cards.brand",
          cardnumber: "$cards.cardnumber",
          cardyear: "$cards.cardyear",
          playername: "$cards.playername",
          cardqty: "$cards.qty",
          totaldv: "$cards.totalDV",
          qty: "$cards.qty",
          pricepercard: "$orders.pricepercard",
          PSASub: "$orders.PSASub"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//Api for invoice
app.post("/getInvoiceDetails", async (req, res) => {
  try {
    const id = req.body.id;
    const userdetails = await User.aggregate([
      {
        $unwind: {
          path: "$orders"
        }
      },
      {
        $match: {
          "orders.orderid": id
        }
      },
      {
        $project: {
          _id: "$orders._id",
          userid: 1,
          orderid: "$orders.orderid",
          name: {
            $concat: ["$name", " ", "$lastname"]
          },
          servicelevel: "$orders.servicelevel",
          status: "$orders.orderStatus",
          poppedDate: "$orders.Gardespopdate",
          paiddate: "$orders.paiddate",
          grname: "$orders.grcompanyname",
          email: 1,
          orderDesc: "$orders.orderType",
          GradingOrdercardquantity: "$orders.cardcount",
          insuranceammount: "$orders.insuranceammount",
          GradingOrderUnitCost: "$orders.pricepercard",
          shipping: "$orders.localpickup"
        }
      }
    ]);
    return res.status(200).json(userdetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000);

//5001 Server confirgure for nashcard application
