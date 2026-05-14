import nodemailer from "nodemailer";
import { resolve } from "node:path";
import { EMAIL, PASS } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";
export const sendEmail = async (
  mailOptions : Mail.Options 
  ) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
    auth: {
      user: EMAIL,
      pass: PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `matar <${EMAIL}>`,
    ...mailOptions
      // {
      //   filename: "Dexter.png",
      //   path: resolve("src/f0de3b3e6342750b3649929a7d4efff3.jpg"),
      // },
      // {
      //   filename: "dexter.html",
      //   path: resolve("src/test.html")
      // },
    // ],
  });
  console.log("message sent", info);
  return info.accepted.length > 0 ? true : false;
};

export const generateOtp = async () => {
  return Math.floor(Math.random() * 900000 + 100000);
};
