import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateDocx } from "./services/docxService.js";
import fs from "fs";
import { convertDocxToPdf } from "./services/pdfService.js";
import { sendResendEmailWithPdf } from "./services/resendEmailService.js";
import rateLimit from "express-rate-limit";

dotenv.config(); //load enviroment first

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // for now — later we’ll lock it down
  }),
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

// ----------------------------
// Rate Limiter
// ----------------------------

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per window
  message: { error: "Too many requests, please try again later" },
});
// Apply only to /send-invitation
app.use("/send-invitation", limiter);

//  Endpoint
app.post("/send-invitation", async (req, res) => {
  try {
    const { Title, name, organization, date, email } = req.body;

    // 1 — generate DOCX
    const docxBuffer = generateDocx({ Title, name, organization, date });

    // 2 — convert to PDF
    const pdfBuffer = await convertDocxToPdf(docxBuffer);

    // 3 — send email with Resend
    const result = await sendResendEmailWithPdf(
      email,
      `Your Invitation for EuroGames112 | Albi, France`,
      `<p>Dear ${Title} ${name},</p><p>Thank you for your interest in EuroGames112.</p><p>Please find attached your personalized invitation PDF, generated based on the information you provided in the form.</p><p>EuroGames112 brings together police officers, firefighters, and first responders from across Europe through sport, community, and shared values. We are pleased to welcome you to this unique initiative.</p><p>If you have any questions or need further information, feel free to contact us.</p><p>We look forward to your participation.</p><p>Kind regards,</p><p>The EuroGames112 Team</p>`,
      pdfBuffer,
    );

    res.json({ message: "Invitation sent!", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Port (Render provides PORT automatically)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
