const fetch = require('node-fetch');
const { encodeBase64 } = require('js-base64');

const ownerTemplate = ({ name, email, purpose, description }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;">
      <h2 style="color:#6a11cb;text-align:center;">New Contact Request</h2>
      <hr/>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Purpose:</strong> <span style="color:#6a11cb;font-weight:bold;">${purpose}</span></p>
      <div style="margin-top:10px;padding:10px;background:#f9f9f9;border-radius:8px;">
        <strong>Description:</strong>
        <p>${description}</p>
      </div>
      <p style="margin-top:20px;font-size:14px;color:#777;">Please respond to this user as soon as possible.</p>
    </div>
  </div>
`;

const userTemplate = ({ name, purpose }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;text-align:center;">
      <h2 style="color:#6a11cb;">Thank You, ${name}!</h2>
      <p style="font-size:16px;">We've received your request regarding:</p>
      <p style="font-size:18px;font-weight:bold;color:#6a11cb;">${purpose}</p>
      <div style="margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px;">Our team will get back to you shortly.</div>
      <p style="font-size:14px;color:#777;">Thank you for reaching out to us.</p>
      <hr/>
      <p style="font-size:14px;">Regards,<br/><strong>Contact App</strong></p>
    </div>
  </div>
`;

function encodeEmail(email) {
  const str = email.replace(/\+/g, '-').replace(/\//g, '_');
  return str.replace(/=+$/, '');
}

async function refreshAccessToken(clientId, clientSecret, refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function sendEmailGmail(accessToken, to, from, subject, html) {
  const emailLines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ];
  const raw = emailLines.join('\r\n');
  const encodedMessage = encodeEmail(Buffer.from(raw).toString('base64'));

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gmail API error: ${JSON.stringify(data)}`);
  }
  return data;
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, purpose, description } = req.body;

  if (!name || !email || !purpose || !description) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const ownerEmail = process.env.OWNER_EMAIL || 'subhamsupriyamohapatra@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || 'subhamsupriyamohapatra@gmail.com';

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(500).json({
      success: false,
      error: 'Gmail API credentials not configured',
      envCheck: {
        GMAIL_CLIENT_ID: !!clientId,
        GMAIL_CLIENT_SECRET: !!clientSecret,
        GMAIL_REFRESH_TOKEN: !!refreshToken,
      },
    });
  }

  try {
    const accessToken = await refreshAccessToken(clientId, clientSecret, refreshToken);

    await sendEmailGmail(accessToken, ownerEmail, fromEmail, `New Contact: ${purpose}`, ownerTemplate({ name, email, purpose, description }));

    await sendEmailGmail(accessToken, email, fromEmail, 'Thank You for Contacting Us', userTemplate({ name, purpose }));

    return res.status(200).json({ success: true, message: 'Message sent successfully 🚀' });
  } catch (error) {
    console.error('Gmail API Error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to send message', details: error.message });
  }
};
