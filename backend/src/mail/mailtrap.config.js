import dotenv from "dotenv";
import Mailgen from "mailgen";
import { MailtrapClient } from "mailtrap";

dotenv.config();

export const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "MERN AUTH",
    link: process.env.MAILTRAP_SENDER_ADDRESS || "https://your-app-domain.com",
    logo: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
  },
});

export const mailtrapClient = new MailtrapClient({ token: process.env.MAILTRAP_PASS });

export const sender = {
  email: process.env.MAILTRAP_SENDER_ADDRESS,
  name: "MERN AUTH Team",
};
