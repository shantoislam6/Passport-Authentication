const nodeMailer = require("nodemailer");

module.exports = (email, token) => {
  return new Promise((resolve, reject) => {
    const url = process.env.SITE_URL
      ? process.env.SITE_URL + "/verifing?token=" + token
      : `http://localhost:3200/verifing?token=${token}`;
    const content = `
            <h1>NODE PASSPORT</h1>
            <p>Click Here And Verify Your Account!!</p>
            <a href="${url}">Verify</a><br>
            <a href="${url}">${url}</a>
     `;

    // create reusable transporter object using the default SMTP transport
    nodeMailer
      .createTransport({
        service: "gmail",
        auth: {
          user: "ishanto412@gmail.com",
          pass: "0)?9(/0)?9(/0)?9(/1"
        }
      })
      .sendMail({
        from: '"NODE PASSPORT" <shanto@developermaruf.com>', // sender address
        to: email, // list of receivers
        subject: "Sent a verication token to verify your account", // Subject line
        html: content // html body
      })
      .then(() => {
        resolve(true);
      })
      .catch(err => reject(err));
  });
};
