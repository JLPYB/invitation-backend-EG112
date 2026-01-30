import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export function generateDocx(data) {
  // 1. Load the DOCX template
  const templatePath = path.resolve("src/templates/invitation.docx");
  const content = fs.readFileSync(templatePath, "binary");

  // 2. Unzip the DOCX
  const zip = new PizZip(content);

  // 3. Create docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // 4. Inject variables
  doc.render({
    Title: data.Title,
    name: data.name,
    organization: data.organization,
    date: data.date,
  });

  // 5. Generate new DOCX buffer
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return buffer;
}
