const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async ({ to, from, replyTo, subject, html }) => {
  if (!process.env.USER_EMAIL || !process.env.USER_PASSWORD) {
    console.warn("⚠️ SMTP credentials not configured (USER_EMAIL/USER_PASSWORD missing). Skipping email send.");
    return false;
  }
  try {
    await transporter.sendMail({
      from: from || `"Sumit Chakraborty Academy" <${process.env.USER_EMAIL}>`,
      to,
      replyTo,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
};

const otpEmailTemplate = (name, otp) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#090040;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#0F0052,#1a0080);border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#471396,#B13BFF);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px">Sumit Chakraborty Academy</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Email Verification</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#fff;margin-top:0">Hello, ${name}! 👋</h2>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6">
        Your One-Time Password (OTP) for account verification is:
      </p>
      <div style="background:linear-gradient(135deg,#FF2E93,#B13BFF);border-radius:12px;padding:24px;text-align:center;margin:24px 0">
        <span style="color:#fff;font-size:42px;font-weight:bold;letter-spacing:12px">${otp}</span>
      </div>
      <p style="color:rgba(255,255,255,0.5);font-size:14px">
        ⏱️ This OTP is valid for <strong style="color:#FF2E93">10 minutes</strong>.<br>
        Do not share this OTP with anyone.
      </p>
    </div>
    <div style="background:rgba(0,0,0,0.3);padding:20px;text-align:center">
      <p style="color:rgba(255,255,255,0.4);margin:0;font-size:12px">
        © ${new Date().getFullYear()} Sumit Chakraborty Academy. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

const resetPasswordEmailTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#090040;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#0F0052,#1a0080);border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#471396,#B13BFF);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px">Sumit Chakraborty Academy</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Password Reset</p>
    </div>
    <div style="padding:40px">
      <h2 style="color:#fff;margin-top:0">Hello, ${name}!</h2>
      <p style="color:rgba(255,255,255,0.7)">Click the button below to reset your password:</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetUrl}" style="background:linear-gradient(135deg,#FF2E93,#B13BFF);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:bold">
          Reset Password
        </a>
      </div>
      <p style="color:rgba(255,255,255,0.5);font-size:14px">This link expires in 30 minutes.</p>
    </div>
  </div>
</body>
</html>`;

const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#090040;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#0F0052,#1a0080);border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#471396,#B13BFF);padding:40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px">🎉 Welcome to Sumit Chakraborty Academy!</h1>
    </div>
    <div style="padding:40px">
      <h2 style="color:#fff;margin-top:0">Welcome, ${name}!</h2>
      <p style="color:rgba(255,255,255,0.7);line-height:1.8">
        Your account has been successfully verified. Start exploring our premium courses in JEE, NEET, Science and Commerce!
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${process.env.CLIENT_URL}/courses" style="background:linear-gradient(135deg,#FF2E93,#B13BFF);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:bold">
          Explore Courses
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

module.exports = { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate, welcomeEmailTemplate };
