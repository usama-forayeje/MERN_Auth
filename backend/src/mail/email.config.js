import dotenv from "dotenv";
import Mailgen from "mailgen";
import { MailtrapClient } from "mailtrap";

dotenv.config();

export const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "MERN AUTH",
    link: process.env.CLIENT_URL || "https://your-app.com",
    logo: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
  },
});

export const sender = {
  email: process.env.MAILTRAP_SENDER_ADDRESS,
  name: "MERN AUTH Team",
};

export const mailtrapClient = new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN });
