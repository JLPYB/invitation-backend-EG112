import fs from "fs";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResendEmailWithPdf(to, subject, text, pdfBuffer) {
  // Convert PDF buffer to base64
  const attachmentBase64 = pdfBuffer.toString("base64");

  // Send email via Resend
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM, // e.g. "Invitations <invitations@yourdomain.com>"
    to: [to], // recipient
    subject,
    html: text, // HTML content, can be simple
    attachments: [
      {
        content: attachmentBase64,
        filename: "invitation.pdf",
      },
    ],
  });

  if (error) {
    throw new Error(`Resend send error: ${JSON.stringify(error)}`);
  }

  return data;
}
