import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateDocx } from "./services/docxService.js";
import fs from "fs";
import { convertDocxToPdf } from "./services/pdfService.js";
import { sendResendEmailWithPdf } from "./services/resendEmailService.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Backend is running 🚀" });
});

// Test Endpoint
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
      `Your Invitation from EuroGames112 | Albi, France`,
      `<p>Hello ${Title} ${name},</p><p>Here is your invitation for EuroGames112.</p>`,
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
