import nodemailer from "nodemailer";
import { mailGenerator } from "./email.config.js";
import { ApiError } from "../utils/api-errors.js";

export const sendMail = async ({ email, subject, mailgenContent }) => {
  const emailText = mailGenerator.generatePlaintext(mailgenContent);
  const emailHtml = mailGenerator.generate(mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAILTRAP_SENDER_ADDRESS,
    to: email,
    subject,
    text: emailText,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Email sending error:", err);
    throw new ApiError(500, "Failed to send email.");
  }
};
