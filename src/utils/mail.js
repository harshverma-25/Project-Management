import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1️⃣ Mailgen setup
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Management App",
      link: "https://project-management-app.com",
    },
  });

  // 2️⃣ Generate HTML email (ONLY THIS METHOD EXISTS)
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // 3️⃣ Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true only for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4️⃣ Email options
  const mail = {
    from: `"Project Management" <${process.env.EMAIL_USER}>`,
    to: options.email, // ✅ FIXED
    subject: options.subject,
    html: emailHtml,
  };

  // 5️⃣ Send email
  await transporter.sendMail(mail);
};

/// 📧 Email verification template
const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! We're excited to have you on board.",
      action: {
        instructions: "To verify your email, please click the button below:",
        button: {
          color: "#1aae5a",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help or have questions? Just reply to this email — we'd love to help.",
    },
  };
};

/// 🔐 Forgot password template
const forgotPasswordMailgenContent = (username, resetUrl) => {
  return {
    body: {
      name: username,
      intro: "You requested to reset your password.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#1aae5a",
          text: "Reset your password",
          link: resetUrl,
        },
      },
      outro:
        "If you didn't request a password reset, you can safely ignore this email.",
    },
  };
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};
