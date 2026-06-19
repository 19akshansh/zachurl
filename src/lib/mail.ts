import { envSchem } from "@/config/env";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envSchem.EMAIL_USER,
    pass: envSchem.EMAIL_PASS,
  },
});
