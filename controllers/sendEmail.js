const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require("uuid");

// Load environment variables from .env file
require('dotenv').config();

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Ethereal Email Sending Function (for testing)
const sendEmailEthereal = async (req, res) => {
    try {
        // Create a test Ethereal account (you can use a fixed one here if you prefer)
        

        const transporter = nodemailer.createTransport({
            service: 'gamil',
            secure: true,
            port: 465,
            auth: {
                user: 20102122@apsit.edu.in,  // Use your Ethereal email
                pass: ncpq jzlm jpnp gsvh   // Use your Ethereal password
            },
            tls: {
                rejectUnauthorized: false  // In case of self-signed certificates
            }
        });

        let info = await transporter.sendMail({
            from: '20102122@apsit.edu.in',
            to: "sjnigam10@gmail.com",  // Send to the test email
            subject: 'Hello',
            html: '<h2>Sending Emails With Node.js</h2>'
        });

        res.json(info);
    } catch (error) {
        console.error("Error sending email using Ethereal:", error);
        res.status(500).json({ error: error.message });
    }
};

// Send Email using SendGrid
const sendEmailSendGrid = async (receiverEmail, fileID, senderName = "Encrypt Share") => {
    try {
        const msg = {
            to: receiverEmail,
            from: 'your-email@example.com', // Replace with your verified SendGrid sender email
            subject: 'Here is your File ID!',
            text: `Dear user, here is your File ID: ${fileID}`,
            html: `<h3>Dear user,</h3><br/> Download page: <a href='http://localhost:5173/download'>download page link</a> <br />Here is your File ID: <strong>${fileID}</strong><br /><br /><b>Because of our security policy, we don't share passwords. You need to ask the sender for it.</b>`
        };

        const response = await sgMail.send(msg);

        // Log the response for debugging
        console.log(response);

        if (response[0].statusCode === 202) {
            return { success: true, message: "Email sent successfully" };
        } else {
            return { success: false, error: "Failed to send email" };
        }
    } catch (error) {
        console.error("Error sending email using SendGrid:", error);
        return { success: false, error: error.message };
    }
};

// Example usage for testing the SendGrid function
const sendEmail = async (req, res) => {
    const { receiverEmail, fileID, senderName } = req.query;

    const result = await sendEmailSendGrid(receiverEmail, fileID, senderName);
    if (result.success) {
        res.status(200).json({ msg: result.message });
    } else {
        res.status(500).json({ error: result.error });
    }
};

module.exports = { sendEmailEthereal, sendEmailSendGrid, sendEmail };
