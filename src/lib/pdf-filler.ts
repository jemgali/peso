import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

/**
 * Configuration for a single data field in the PDF
 */
export interface PDFFieldMapping {
  text: string;
  x: number;
  y: number;
  size?: number;
  page?: number;
}

/**
 * Service to fill a static PDF by drawing text at specific coordinates
 */
export class PDFFillerService {
  /**
   * Fills a PDF template with the provided data mappings
   * @param templateName The filename of the PDF in public/form-layouts/
   * @param mappings Array of field mappings (text and coordinates)
   * @returns The generated PDF as a Uint8Array
   */
  static async fillTemplate(templateName: string, mappings: PDFFieldMapping[]): Promise<Uint8Array> {
    const templatePath = path.join(process.cwd(), 'public', 'form-layouts', templateName);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Load font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();

    for (const mapping of mappings) {
      const pageIndex = mapping.page || 0;
      const page = pages[pageIndex];
      
      if (!page) continue;

      const { width, height } = page.getSize();
      
      // pdf-lib uses 0,0 at BOTTOM LEFT
      // We'll use y from the top if the user prefers, but standard is bottom-left
      page.drawText(mapping.text || '', {
        x: mapping.x,
        y: mapping.y,
        size: mapping.size || 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }

    return await pdfDoc.save();
  }
}
