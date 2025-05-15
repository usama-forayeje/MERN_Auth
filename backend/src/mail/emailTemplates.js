export const emailVerifyOtpMailGenContent = async (username, otp) => ({
  body: {
    name: username,
    intro: `🎉 Welcome to <strong>MERN AUTH</strong>!`,
    action: {
      instructions: "Use the OTP below to verify your email:",
      button: {
        color: "#ff6b6b",
        text: `OTP: ${otp}`,
        link: "#",
      },
    },
    table: {
      data: [
        {
          "Secure OTP": `<div style="font-size:24px;font-weight:bold;color:#ff6b6b;letter-spacing:3px;">${otp}</div>`,
        },
      ],
      columns: {
        customWidth: { "Secure OTP": "100%" },
        customAlignment: { "Secure OTP": "center" },
      },
    },
    outro: "⏳ OTP valid for 24 hours. If not requested by you, ignore this email.",
    signature: "Warm regards,\nMERN AUTH Team",
  },
});

export const emailWelcomeMailGenContent = async (username) => ({
  body: {
    name: username,
    intro: `🎉 Welcome aboard, ${username}!`,
    table: {
      data: [
        {
          "Your Role": "User",
          "Getting Started": "Verify email, explore dashboard, personalize profile.",
        },
      ],
      columns: {
        customWidth: { "Your Role": "30%", "Getting Started": "70%" },
        customAlignment: { "Your Role": "center", "Getting Started": "left" },
      },
    },
    action: {
      instructions: "Click below to access your dashboard:",
      button: {
        color: "#007bff",
        text: "Go to Dashboard",
        link: `${process.env.CLIENT_URL || "https://your-app.com/dashboard"}`,
      },
    },
    outro: "Need help? Reply this email or visit our Help Center.",
    signature: "Cheers,\nMERN AUTH Team",
  },
});

export const emailPasswordResetRequestContent = async (username, resetLink) => ({
  body: {
    name: username,
    intro: "Password reset requested...",
    action: {
      instructions: "Click below or paste the link in your browser:",
      button: {
        color: "#ff6b6b",
        text: "Reset Your Password",
        link: resetLink,
      },
      fallback: {
        text: `Or visit: ${resetLink}`,
        link: resetLink,
      },
    },
    outro: "Link valid for 15 minutes.",
    signature: "Regards,\nMERN AUTH Team",
  },
});

export const sendPasswordResetSuccessEmail = async (username) => ({
  body: {
    name: username,
    intro: "✅ Your password has been successfully reset.",
    table: {
      data: [{ Username: username, Action: "Password Reset", Status: "Successful" }],
      columns: {
        customWidth: { Username: "25%", Action: "50%", Status: "25%" },
        customAlignment: { Username: "center", Action: "left", Status: "center" },
      },
    },
    outro: "If this wasn’t you, contact support immediately.",
    signature: "Best,\nMERN AUTH Team",
  },
});
