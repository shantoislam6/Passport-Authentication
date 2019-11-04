const nodeMailer = require('nodemailer');

module.exports = (email, token)=>{
    return new Promise((resolve, reject)=>{
        const content = `
            <h1>NODE PASSPORT</h1>
            <p>Click Here And Verify Your Account!!</p>
            <a href="http://localhost:3200/verifing?token=${token}">Verify</a><br>
            <a href="http://localhost:3200/verifing?token=${token}"> http://localhost:3200/verifing?token=${token}</a>
     `;
    
        // create reusable transporter object using the default SMTP transport
        nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ishanto412@gmail.com',
                pass: '0)?9(/0)?9(/0)?9(/1'
            },
        }).sendMail({
            from: '"NODE PASSPORT" <ishanto412@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Sent a verication token to verify your account", // Subject line
            html: content // html body
        })
        .then(()=>{
            resolve(true);
        })
        .catch(err=> reject(err))

    })
}