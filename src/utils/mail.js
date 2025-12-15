import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) =>
{
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Management App",
            link: "https://project-management-app.com",
        },
    });
    const emailTextual = mailGenerator.generate(options.mailgenContent);

    const emailHtml = mailGenerator.generateHtml(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.to,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
    }

}
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
      outro: "Need help or have questions? Just reply to this email — we'd love to help.",
    },
  };
};

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
      outro: "If you didn't request a password reset, you can safely ignore this email.",
    },
  };
};

export { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail };
