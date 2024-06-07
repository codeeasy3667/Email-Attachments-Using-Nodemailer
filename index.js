const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/send-email', upload.array('attachments', 10), (req, res) => { // Allow up to 10 files
    const { name, email, message, subject } = req.body;
    const files = req.files;


    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or use your email provider
        auth: {
            user: 'Your_email_address',
            pass: 'App Passwords'
        }
    });

    // Setup email data with unicode symbols
    const mailOptions = {
        from: `${name} <Your_email_address>`,
        to: "Your_email_address",
        subject: subject + " From:" + email,
        text: message,
        attachments:files.map(file => ({
            filename: file.originalname,
            path: file.path
        }))
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        // Delete the file after sending email
        files.forEach(file => fs.unlinkSync(file.path));
        res.send('<script>alert("Email sent successfully!"); window.location.href = "/";</script>');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
