const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587 ,
    auth: {
      user: "postmaster@mg.ravebae.org",
      pass: "f2196e223f21f58a40e250a351f02527-eb38c18d-42f0ff3b"
    }
});

const sendEmail = (email, verificationCode, subject) => {
    const mailOptions = {
        from: "noreply@ravebae.com",
        to: email,
        subject: subject,
        html: `<p>Your verification code is ${verificationCode} </p>`,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
    });
};

module.exports = { sendEmail };
