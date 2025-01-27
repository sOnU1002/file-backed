require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db/connect");
const File = require("./models/File");
const fs = require("fs");
const rateLimit = require('express-rate-limit');
const nosqlSanitizer = require('express-nosql-sanitizer');
const { xss } = require('express-xss-sanitizer');
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use(nosqlSanitizer());

app.use(limiter);

app.use(cors({
  exposedHeaders: ['Content-Disposition']
}));
app.use(fileUpload());

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465, // Can be replaced with any email provider
  auth: {
    user: "20102122@apsit.edu.in",  // your email address
    pass: "ncpq jzlm jpnp gsvh"   // your email password or app password
  }
});

const sendEmail = async (receiverEmail, fileID, senderName = "Encrypt Share") => {
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER}>`, // Sender's email
      to: receiverEmail, // Recipient's email
      subject: "Here is your File ID!",
      text: `Dear user, here is your File ID: ${fileID}`,
      html: `
        <h3>Dear user,</h3>
        <br/> Download page: <a href='http://localhost:4000/download'>download page link</a>
        <br />Here is your File ID: <strong>${fileID}</strong><br />
        <br /><b>Because of our security policy we don't share passwords. You need to ask the sender for it.</b>
      `
    });

    console.log('Email sent:', info.response);
    return { success: true, data: info.response };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: err.message };
  }
};

app.post("/", express.json(), async (req, res) => {
  console.log("Received file upload request"); // Log file upload request

  if (!req.files || !req.files.encryptedFile) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const file = req.files.encryptedFile;
  const originalName = req.body.originalName;
  const receiverEmail = req.body.receiverEmail;
  const password = req.body.password;

  const filename = Date.now() + "_" + file.name;
  console.log("Uploading file:", filename, "Original Name:", originalName); // Log file details on upload

  const uploadPath = __dirname + "/uploads/" + filename;
  try {
    await file.mv(uploadPath);

    const extension = path.extname(originalName);
    const fileId = uuidv4();
    const downloadLink = `http://localhost:4000/download/${fileId}`;

    const newFile = new File({
      fileName: filename,
      originalName: originalName,
      path: uploadPath,
      downloadLink: downloadLink,
      extension: extension,
      password: password
    });
    await newFile.save();

    if (receiverEmail) {
      try {
        await sendEmail(receiverEmail, fileId);
        console.log(`Email sent to ${receiverEmail}`); // Log email sent
      } catch (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({ msg: "Error sending email", error: error.message });
      }
    }

    res.status(200).json({ msg: "File uploaded successfully", link: downloadLink });
  } catch (err) {
    console.error("Error while uploading file:", err.message);
    res.status(500).send({ msg: "Error while uploading file", error: err.message });
  }
});

app.get("/download/:id", async (req, res) => {
  console.log("Download request received for file ID:", req.params.id); // Log download request

  try {
    const file = await File.findOne({
      downloadLink: `http://localhost:4000/download/${req.params.id}`,
    });

    const password = req.headers['password'];

    if (!file || !file.path || file.password !== password) {
      return res.status(403).send({ msg: "Access denied" });
    }

    const filename = file.originalName || "downloaded_file";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );
    res.download(file.path, filename, async (err) => {
      if (!err) {
        console.log("File downloaded successfully"); // Log successful download
        await File.deleteOne({ _id: file._id });

        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file:", unlinkErr);
          } else {
            console.log("File successfully deleted after download.");
          }
        });
      }
    });
  } catch (err) {
    console.error("Error retrieving file:", err.message);
    res.status(500).send({ msg: "Error retrieving file", error: err.message });
  }
});

app.post("/send", express.json(), async (req, res) => {
  const { receiverEmail, fileID, senderName } = req.query;
  try {
    await sendEmail(receiverEmail, fileID, senderName);
    console.log(`Email sent to ${receiverEmail}`); // Log email sent
    res.status(200).json({ msg: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log("Server is listening on port " + port); // Log server startup
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
