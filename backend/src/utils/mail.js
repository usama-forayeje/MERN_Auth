import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "./api-errors.js";

export const sendMail = async (options) => {
  var mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "MERN AUTH",
      link: "https://mailgen.js/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });
  var emailText = mailGenerator.generatePlaintext(options.mailgenContent);
  var emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAILTRAP_SENDER_ADDRESS, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: emailText, // plain text body
    html: emailHtml, // html body
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ApiError(500, "Email not sent");
  }
};


export const forgotPasswordMailGenContent = async (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We got a request to reset your password",
      action: {
        instruction: "Please click the button below to rest your password.",
        button: {
          color: "#22BC66",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export const twoFactorAuthMailGenContent = async (username, otp) => {
  return {
    body: {
      name: username,
      intro: "We received a request to verify your identity via OTP.",
      action: {
        instruction: `Your OTP is:`,
        button: {
          color: "#22BC66",
          text: `${otp}`,  // Display OTP in the button itself
        },
      },
      outro: `This OTP will expire in 60 minutes. If you did not request this, please ignore this message.`,
      table: {
        data: [
          {
            OTP: `<strong style="font-size: 24px; color: #ff6b6b;">${otp}</strong>`, // Highlight OTP in big, bold, red color
          },
        ],
      },
      signature: "If you need assistance, feel free to reply to this email. We're happy to help.",
    },
  };
};

export const emailVerifyOtpMailGenContent = async (username, otp) => {
  return {
    body: {
      name: username,
      intro: "Welcome to MERN AUTH! We're thrilled to have you here.",
      action: {
        instruction: "To complete your registration, please verify your email using the OTP below.",
        button: {
          color: "#22BC66",
          text: `${otp}`,  // OTP is shown inside the button
        },
      },
      table: {
        data: [
          {
            "Your OTP": `<strong style="font-size: 22px; color: #ff6b6b;">${otp}</strong>`,
          },
        ],
        columns: {
          customWidth: {
            "Your OTP": "30%",
          },
          customAlignment: {
            "Your OTP": "center",
          },
        },
      },
      outro: "This OTP is valid for 24 hours. If you did not request this, please ignore this message.",
      signature: "Thanks,\nMERN AUTH Team",
    },
  };
};
