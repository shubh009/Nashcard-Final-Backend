const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gupta.shubhanshu007@gmail.com',
        pass: 'bjzvvlumhuimipwq'
    }
});

const mailOptions = {
    from: 'gupta.shubhanshu007@gmail.com',
    to: 'conser.in3@gmail.com',
    subject: 'Verify OTP Mail',
    text: 'Verify Your OTP With Nashcard and Your OTP Is: 245678. '
};

let info = transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
        // do something useful
    }
});