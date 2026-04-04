const { sendContactEmails } = require("../shared/mailer");

module.exports = async (req, res) => {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  const { name, email, purpose, description } = req.body;

  // Validation
  if (!name || !email || !purpose || !description) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    // Send emails (shared logic)
    await sendContactEmails({ name, email, purpose, description });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully 🚀",
    });

  } catch (error) {
    console.error("Vercel Email Error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to send email",
    });
  }
};