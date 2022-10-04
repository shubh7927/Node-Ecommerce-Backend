const nodemailer = require("nodemailer");
const sendEmail = async (emailObject) => {
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