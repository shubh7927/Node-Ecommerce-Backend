const nodemailer = require("nodemailer");
require("dotenv").config({ path: "backend/.env" });
const sendEmail = async (emailObject) => {
    console.log(process.env.HOST_EMAIL_ADDRESS);
    console.log(process.env.HOST_EMAIL_PASSWORD);
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port:465,
        service: "gmail",
        auth: {
            user: process.env.HOST_EMAIL_ADDRESS,
            pass: process.env.HOST_EMAIL_PASSWORD
        }
    })

    const emailToBeSend = {
        from: process.env.HOST_EMAIL_ADDRESS,
        to: emailObject.email,
        subject: emailObject.subject,
        text: emailObject.body
    }
    await transporter.sendMail(emailToBeSend);
}
module.exports = sendEmail;