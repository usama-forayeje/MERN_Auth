import { ApiError } from "../utils/api-errors.js";
import {
  emailPasswordResetRequestContent,
  emailVerifyOtpMailGenContent,
  emailWelcomeMailGenContent,
  sendResetSuccessContent,
} from "./emailTemplates.js";
import { mailGenerator, mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, otp, username = "User") => {
  const recipient = [{ email }];

  try {
    const emailContent = await emailVerifyOtpMailGenContent(username, otp);
    const mailBody = mailGenerator.generate(emailContent);

    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: mailBody,
      category: "Email Verification",
    });

    console.log("✅ Email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new ApiError(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, username = "User") => {
  const recipient = [{ email }];

  try {
    const emailContent = await emailWelcomeMailGenContent(username);
    const mailBody = mailGenerator.generate(emailContent);

    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: `🎉 Welcome to MERN AUTH, ${username}!`,
      html: mailBody,
      category: "Welcome Email",
    });

    console.log("✅ Welcome email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw new ApiError(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetRequestEmail = async (email, resetLink, username = "User") => {
  const recipient = [{ email }];

  try {
    const emailContent = await emailPasswordResetRequestContent(username, resetLink);
    const mailBody = mailGenerator.generate(emailContent);

    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "🔐 Password Reset Request",
      html: mailBody,
      category: "Password Reset",
    });

    console.log("✅ Password reset request email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending password reset request email:", error);
    throw new ApiError(`Error sending password reset request email: ${error.message}`);
  }
};

export const sendPasswordResetSuccessEmail = async (email, username = "User") => {
  const recipient = [{ email }];

  try {
    const emailContent = await sendResetSuccessContent(username);
    const mailBody = mailGenerator.generate(emailContent);

    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "✅ Your Password has been Reset",
      html: mailBody,
      category: "Password Reset Success",
    });

    console.log("✅ Password reset success email sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending password reset success email:", error);
    throw new ApiError(`Error sending password reset success email: ${error.message}`);
  }
};
