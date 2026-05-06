import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateGridHelper(fileName: string) {
  const templatePath = path.join(process.cwd(), 'public', 'form-layouts', fileName);
  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    
    // Draw horizontal lines and labels
    for (let y = 0; y <= height; y += 50) {
      page.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      page.drawText(`${y}`, { x: 5, y: y + 2, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    }

    // Draw vertical lines and labels
    for (let x = 0; x <= width; x += 50) {
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      page.drawText(`${x}`, { x: x + 2, y: 5, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    }

    page.drawText(`PAGE ${index + 1} - GRID HELPER`, {
      x: width / 2 - 50,
      y: height - 20,
      size: 10,
      font,
      color: rgb(1, 0, 0),
    });
  });

  const outputName = fileName.replace('.pdf', '-grid.pdf');
  const outputPath = path.join(process.cwd(), 'public', 'form-layouts', outputName);
  fs.writeFileSync(outputPath, await pdfDoc.save());
  console.log(`Grid helper generated at: ${outputPath}`);
}

const file = process.argv[2] || 'dole-spes-application.pdf';
generateGridHelper(file).catch(console.error);
