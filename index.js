const express = require("express");
const app = express();
require("dotenv").config();
var mongoose = require("mongoose");
require("./DB/config");
const User = require("./DB/models/User");
const OTP = require("./DB/models/otp");
const { orderModel } = require("./DB/models/gradingorder");
const nodemailer = require("nodemailer");
const servicelevel = require("./DB/models/servicelevel");
const empLogin = require("./DB/models/emp");
const ureviews = require("./DB/models/reviews");
const cors = require("cors");
const otp = require("./DB/models/otp");
const reviews = require("./DB/models/reviews");
const uhelp = require("./DB/models/uhelp");
const orderStatus = require("./DB/models/orderfilter");
const testProfile = require("./DB/models/test");
const { request } = require("express");
const fileUpload = require("express-fileupload");
const connectDatabase = require("./DB/config");
var moment = require("moment");
app.use(express.json());
app.use(fileUpload());
console.log("here");
var options = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

connectDatabase()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Server started on Port : ${process.env.PORT} in ${process.env.NODE_ENV}`
      );
    });
  })
  .catch((err) => {
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
          result: "No user found. Please enter correct email & password",
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
      "name lastname email contact "
    );
    console.log(profile);
    if (profile) {
      resp.send(profile);
    } else {
      resp.send({
        result: "No user found. Please enter correct email & password",
      });
    }
  } else {
    resp.send({ result: "Email & Password both are required for login." });
  }
});

app.patch("/updateprofile", async (req, resp) => {
  const { userid, lastname } = req.body;
  const Ufirstname = req.body.name;
  const Ucontact = req.body.contact;

  let user = await User.findOneAndUpdate(
    { userid: userid },
    {
      $set: {
        name: Ufirstname,
        lastname: lastname,
        contact: Ucontact,
      },
    },
    { new: true }
  );
  resp.send({ user: "Profile Information has been updated" });

  // console.log(newUser);
});

app.post("/sendorderemail", async (req, resp) => {
  if (req.body.uemail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gupta.shubhanshu007@gmail.com",
        pass: "bjzvvlumhuimipwq",
      },
    });

    let message = {
      from: "gupta.shubhanshu007@gmail.com",
      to: req.body.uemail,
      subject: "Thanks For Your Order With Nashcard",
      text: "Thank you for your order with Nashcard. We will send you an email with order detail link. So, you can track your order. ",
    };

    transporter.sendMail(message, function (error, info) {
      if (error) {
        resp.status(500).json("Email sent: " + info.response);
      } else {
        console.log("Email sent: " + info.response);
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
          notes: req.body.notes,
        },
      ],
      grades: [
        // {
        //   // orderid: req.body.orderid,
        //   // cert: req.body.cert,
        //   // grade: req.body.grade,
        //   // description: req.body.description,
        //   // gradeDate: req.body.gradeDate
        // }
      ],
    };
    console.log(neworder);
    console.log(validuser);
    validuser.orders.push(neworder);
    validuser.save();
    resp.status(200).json(validuser);
  }
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
      totalDV: req.body.totalDV,
    };

    const newUser = await User.findOneAndUpdate(
      { userid: req.body.userid },
      { $addToSet: { cards: newcard } },
      { new: true }
    );

    //code for add new card into user list

    // validuser.cards.push(newcard);
    // validuser.save();
    console.log(newUser);
    //resp.status(200).json(newUser);

    const user = await User.findOne({ userid: req.body.userid });
    if (!user) {
      return resp
        .status(401)
        .json({ error: "User with that email doesn't exists" });
    }
    const cards = user.cards;
    console.log(cards);
    if (cards.length === 0) {
      return resp.status(200).json({ isEmpty: true });
    } else {
      resp.status(200).json({ isEmpty: false, cards: cards });
    }
  }
});

app.post("/getcardlist", async (req, resp) => {
  const user = await User.findOne({ userid: req.body.userid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }
  const cards = user.cards;
  console.log(cards);
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

  let card = user.cards.filter((card) => {
    if (_id === card._id.toString()) {
      return card;
    }
  });
  card = card[0];
  console.log(card);
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
  const dltuser = getuser.cards.filter((cards) => {
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
        "orders.$.orderStatus": orderstatus,
      },
    },
    { new: true }
  );

  resp.status(200).json(newUser);
});

app.patch("/updatecard/:id/", async (req, resp) => {
  const cardid = req.params.id;
  console.log(cardid);
  const {
    userid,
    qty,
    brand,
    cardyear,
    playername,
    attribute,
    totalDV,
    cardnumber,
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
        "cards.$.brand": brand,
      },
    },
    { new: true }
  );

  resp.status(200).json(newUser);
});

app.patch("/updateorderfinal/:orderid", async (req, resp) => {
  const orderid = req.params.orderid;
  const { userid, insuranceammount, textalert } = req.body;
  console.log("I love you");
  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": orderid, "orders.userid": userid },
    {
      $set: {
        "orders.$.insuranceammount": insuranceammount,
        "orders.$.textmessagealert": textalert,
        "orders.$.isordercomplete": true,
      },
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
    PassesPrice,
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
        "orders.$.PassesPrice": PassesPrice,
      },
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
        expirein: new Date().getTime() + 300 * 1000,
      });
      let otpResponse = await otpData.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "gupta.shubhanshu007@gmail.com",
          pass: "bjzvvlumhuimipwq",
        },
      });

      let message = {
        from: "gupta.shubhanshu007@gmail.com",
        to: req.body.email,
        subject: "Verify OTP Mail",
        text: "Verify Your OTP With Nashcard and Your OTP Is: " + otpcode + ".",
      };

      transporter.sendMail(message, function (error, info) {
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
    Otp: Otp,
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
  console.log(orderid);
  console.log(orderStatus);
  let user = await User.findOneAndUpdate(
    { "orders.orderid": orderid },
    {
      $set: {
        "orders.$.orderStatus": orderStatus,
      },
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
      "orders.PSASub": subid,
    }).select("orders");
    length = user.length;
  }

  if (length > 0) {
    user.forEach((Nuser) => {
      Nuser.orders.forEach((Norder) => {
        Norder.grades.forEach((Ngrade) => {
          allGrades.push(Ngrade);
        });
      });
    });

    if (orderid) {
      finalList = allGrades.filter((Lorderid) => {
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
      NewfinalLIst = allGrades.filter((Lcer) => {
        if (Lcer.cert === cert) {
          return Lcer;
        }
      });
      allGrades = [];
      console.log(NewfinalLIst);
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
  user.forEach((Nuser) => {
    Nuser.orders.forEach((Norder) => {
      PSASub = Norder.PSASub;
      Norder.grades.forEach((Ngrade) => {
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
  console.log(endDate);
  if (datefilter) {
    user = await User.find({
      "orders.$.grades.$.gradeDate": startdate,
    }).select("orders");
    console.log(datefilter);
  } else {
    user = await User.find().select("orders");
    console.log(datefilter);
  }

  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let allGrades = [];
  let orderstatus = [];
  user.forEach((Nuser) => {
    Nuser.orders.forEach((Norder) => {
      orderstatus = Norder.orderStatus;
      Norder.grades.forEach((Ngrade) => {
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
    poppedDate,
  } = req.body;

  let newdate = moment(poppedDate);

  const user = await User.findOne({ "orders.orderid": orderid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let orderFound = user.orders.filter((order) => {
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
    backimage: backimage,
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
  let orderFound = user.orders.filter((order) => {
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
    notes: notes,
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
  console.log(_id);
  console.log(userid);
  console.log(orderid);

  const user = await User.findOne({ userid: userid });
  if (!user) {
    return resp
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let orderFound = user.orders.filter((order) => {
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
  let orderGrades = orderFound.grades.filter((grade) => {
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
  let orderFound = user.orders.filter((order) => {
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
  let ordernotes = orderFound.ordernotes.filter((note) => {
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
    userid: req.body.userid,
  });
  if (orderdetails) {
    resp.send(orderdetails);
  } else {
    resp.send({ orderdetails: "No Record Found" });
  }
});

app.post("/profilechangepassword", async (req, resp) => {
  let user = await User.findOne({
    email: req.body.email,
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

app.post("/getreviewlist", async (req, resp) => {
  let reviewlist = await reviews.find({
    userid: req.body.userid,
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

app.post("/gethelplist", async (req, resp) => {
  let helplist = await uhelp.find({
    userid: req.body.userid,
  });
  if (helplist) {
    resp.send(helplist);
  } else {
    resp.send({ helplist: "No Record Found" });
  }
});

app.post("/getorderlist", async (req, resp) => {
  let user = await User.find({
    userid: req.body.userid,
  }).select("-cards");

  console.log(user);
  const orders = user.orders;
  console.log(orders);
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
  console.log(status);
  let user = await User.find({
    "orders.orderStatus": status,
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
            orderid: orderid,
          },
        },
      },
    })
    .toArray();
  resp.status(200).json({ isEmpty: false, orders: orders });
});

app.post("/getOrderAndCardDetails/:uid", async (req, resp) => {
  const userid = req.params.uid;
  const orderid = req.body.orderid;
  let user = await User.findOne({
    userid: userid,
  });

  let orders = user.orders;

  orders = user.orders.filter((orders) => {
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
  console.log(userid);
  const user = await User.findOne({ userid });
  if (!user) {
    return res
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  const orders = user.orders;
  console.log(orders);
  if (orders.length === 0) {
    return res.status(200).json({ isEmpty: true });
  }
  res.status(200).json({ isEmpty: false, orders: orders });
});

app.post("/ordernotelist/:id", async (req, res) => {
  const userid = req.params.id;
  const orderid = req.body.orderid;
  const user = await User.findOne({
    userid: userid,
  });
  if (!user) {
    return res
      .status(401)
      .json({ error: "User with that email doesn't exists" });
  }

  let order = user.orders.filter((order) => {
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
        "orders.$.isorderpaid": isorderpaid,
      },
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
    orders: orders,
  });
});

app.patch("/updateOrderStatus", async (req, resp) => {
  const { _id, orderStatus, mailId, uemail } = req.body;
  let { mailsubject, mailtext } = "";

  const newUser = await User.findOneAndUpdate(
    { "orders.orderid": _id },
    {
      $set: {
        "orders.$.orderStatus": orderStatus,
      },
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
          pass: "bjzvvlumhuimipwq",
        },
      });

      let message = {
        from: "gupta.shubhanshu007@gmail.com",
        to: uemail,
        subject: mailsubject,
        text: mailtext,
      };

      transporter.sendMail(message, function (error, info) {
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
        pass: "bjzvvlumhuimipwq",
      },
    });

    let message = {
      from: "gupta.shubhanshu007@gmail.com",
      to: req.body.uemail,
      subject: mailsubject,
      text: mailtext,
    };

    transporter.sendMail(message, function (error, info) {
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
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.send(err);
    }
  });

  try {
    fs.createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (err) => console.log(err))
      .on("data", (row) => {
        row["_id"] = new mongoose.Types.ObjectId();
        allUsers.push({ ...row });
      })
      .on("end", async (rowCount) => {
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
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.send(err);
    }
  });

  try {
    fs.createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (err) => console.log(err))
      .on("data", (row) => {
        allGrades.push({ ...userData, ...row });
      })
      .on("end", async (rowCount) => {
        const user = await User.findOne({
          userid: userData.userid,
        }).select("orders");

        let orderFound = user.orders.filter((order) => {
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
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.send(err);
    }
  });

  try {
    fs.createReadStream(uploadPath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (err) => console.log(err))
      .on("data", (row) => {
        allCards.push({ ...userData, ...row });
      })
      .on("end", async (rowCount) => {
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

app.listen(5000);

//5001 Server confirgure for nashcard application
