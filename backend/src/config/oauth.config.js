import { OAuth2Client } from "google-auth-library";

const redirectUrl = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/callback/google"; // frontend redirect URL

export const oAuthClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: redirectUrl,
});

export const getGoogleAuthURL = () => {
  const url = oAuthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });

  return url;
};
