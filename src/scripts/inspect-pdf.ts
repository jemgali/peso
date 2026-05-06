import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function inspectPdf() {
  const filePath = path.join(process.cwd(), 'public/form-layouts/dole-spes-application.pdf');
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  console.log(`PDF: ${path.basename(filePath)}`);
  console.log(`Found ${fields.length} fields:`);
  fields.forEach(field => {
    console.log(`- ${field.getName()} (${field.constructor.name})`);
  });
}

inspectPdf().catch(console.error);
