import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

export function convertDocxToPdf(docxBuffer) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const tmpDir = path.resolve("src/tmp");

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const docxPath = path.join(tmpDir, `${id}.docx`);
    const pdfPath = path.join(tmpDir, `${id}.pdf`);

    fs.writeFileSync(docxPath, docxBuffer);

    const libreOfficePath = "libreoffice";

    const command = `"${libreOfficePath}" --headless --convert-to pdf "${docxPath}" --outdir "${tmpDir}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("LibreOffice error:", error);
        console.error("STDERR:", stderr);
        console.error("STDOUT:", stdout);
        return reject(error);
      }

      if (!fs.existsSync(pdfPath)) {
        return reject(
          new Error(
            "PDF was not generated. Check LibreOffice path or permissions.",
          ),
        );
      }

      const pdfBuffer = fs.readFileSync(pdfPath);

      // Cleanup
      fs.unlinkSync(docxPath);
      fs.unlinkSync(pdfPath);

      resolve(pdfBuffer);
    });
  });
}
