export const emailVerifyOtpMailGenContent = async (username, otp) => {
  return {
    body: {
      name: username,
      intro: `
        🎉 Welcome to <strong>MERN AUTH</strong>! We're super excited to have you on board.
      `,
      action: {
        instructions:
          "To complete your registration, please verify your email using the OTP below:",
        button: {
          color: "#ff6b6b",
          text: `Your OTP is: ${otp}`,
          link: "#",
        },
      },
      table: {
        data: [
          {
            "Secure OTP": `<div style="font-size: 24px; font-weight: bold; color: #ff6b6b; letter-spacing: 3px;">${otp}</div>`,
          },
        ],
        columns: {
          customWidth: {
            "Secure OTP": "100%",
          },
          customAlignment: {
            "Secure OTP": "center",
          },
        },
      },
      outro: `
        ⏳ <strong>This OTP is valid for 24 hours.</strong><br />
        If you didn't request this, you can safely ignore this email.
      `,
      signature: "Warm regards,\nMERN AUTH Team",
    },
  };
};

export const emailWelcomeMailGenContent = async (username) => {
  return {
    body: {
      name: username,
      intro: `
        🎉 <strong>Welcome aboard, ${username}!</strong><br />
        We're thrilled to have you with us at <strong>MERN AUTH</strong>.
      `,
      table: {
        data: [
          {
            "Your Role": "User",
            "Getting Started": "Verify your email, explore your dashboard, and personalize your profile.",
          },
        ],
        columns: {
          customWidth: {
            "Your Role": "30%",
            "Getting Started": "70%",
          },
          customAlignment: {
            "Your Role": "center",
            "Getting Started": "left",
          },
        },
      },
      action: {
        instructions: "Jump right in by logging into your account:",
        button: {
          color: "#007bff",
          text: "Go to Dashboard",
          link: `${process.env.CLIENT_URL || "https://your-app-domain.com/dashboard"}`,
        },
      },
      outro: `
        💡 Need help getting started? Visit our Help Center or reply to this email — we're here for you.<br/><br/>
        Welcome again to <strong>MERN AUTH</strong>. Great things are ahead!
      `,
      signature: "Cheers,\nMERN AUTH Team",
    },
  };
};

export const emailPasswordResetRequestContent = async (username, resetLink) => {
  return {
    body: {
      name: username,
      intro: `
        😟 <strong>Password reset requested</strong><br/>
        We received a request to reset your password for your <strong>MERN AUTH</strong> account.
      `,
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#ff6b6b",
          text: "Reset Your Password",
          link: resetLink,
        },
      },
      outro: `
        🕒 <strong>This link is valid for 15 minutes only.</strong><br/>
        If you didn’t request this, no worries! Your account is safe — just ignore this email.
      `,
      signature: "Warm regards,\nMERN AUTH Team",
    },
  };
};

export const sendResetSuccessContent = async (username) => {
  return {
    body: {
      name: username,
      intro: `
        ✅ <strong>Your password has been successfully reset.</strong>
      `,
      table: {
        data: [
          {
            "Username": username,
            "Action": "Password Reset",
            "Status": "Successful",
          },
        ],
        columns: {
          customWidth: {
            Username: "25%",
            Action: "50%",
            Status: "25%",
          },
          customAlignment: {
            Username: "center",
            Action: "left",
            Status: "center",
          },
        },
      },
      outro: `
        🔐 If you did not perform this action, please contact support immediately.<br/><br/>
        Stay safe,<br/><strong>MERN AUTH</strong> Security Team
      `,
      signature: "Best,\nMERN AUTH Team",
    },
  };
};

