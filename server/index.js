const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: "../.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// -----------------------------
// 📧 Email Templates
// -----------------------------

const ownerTemplate = ({ name, email, purpose, description }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;">
      
      <h2 style="color:#6a11cb;text-align:center;">📩 New Contact Request</h2>

      <hr/>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>

      <p>
        <strong>Purpose:</strong>
        <span style="color:#6a11cb;font-weight:bold;"> ${purpose}</span>
      </p>

      <div style="margin-top:10px;padding:10px;background:#f9f9f9;border-radius:8px;">
        <strong>Description:</strong>
        <p>${description}</p>
      </div>

      <p style="margin-top:20px;font-size:14px;color:#777;">
        🚀 Respond to this user as soon as possible.
      </p>
    </div>
  </div>
`;

const userTemplate = ({ name, purpose }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;text-align:center;">
      
      <h2 style="color:#6a11cb;">Thank You, ${name}! 🎉</h2>

      <p style="font-size:16px;">
        We’ve received your request regarding:
      </p>

      <p style="font-size:18px;font-weight:bold;color:#6a11cb;">
        ${purpose}
      </p>

      <div style="margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px;">
        Our team will get back to you shortly.
      </div>

      <p style="font-size:14px;color:#777;">
        Thank you for reaching out to us 💙
      </p>

      <hr/>

      <p style="font-size:14px;">
        Regards,<br/>
        <strong>Your Company</strong>
      </p>
    </div>
  </div>
`;

// -----------------------------
// 🚀 API Route
// -----------------------------

app.post("/api/contact", async (req, res) => {
  const { name, email, purpose, description } = req.body;

  // Validation
  if (!name || !email || !purpose || !description) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 📩 Send Email to YOU (Admin)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact: ${purpose}`,
      html: ownerTemplate({ name, email, purpose, description }),
    });

    // 📩 Send Email to USER
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎉 Thank You for Contacting Us",
      html: userTemplate({ name, purpose }),
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully 🚀",
    });

  } catch (error) {
    console.error("Email Error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

// -----------------------------
// 🌐 Server Start
// -----------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});