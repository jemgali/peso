import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface SpesApplicationData {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix?: string;
  birthdate: string;
  age: number;
  sex: string;
  placeOfBirth: string;
  address: string;
  contactNumber: string;
  email: string;
  schoolName: string;
  course: string;
  yearLevel: string;
  // Add more fields as needed
}

export async function generateSpesApplicationPdf(data: SpesApplicationData) {
  const templatePath = path.join(process.cwd(), 'public/form-layouts/dole-spes-application.pdf');
  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Try to fill common field names
  // We might need to map these exactly to the PDF field names once we know them
  try {
    const fieldMapping: Record<string, string> = {
      'lastName': data.lastName,
      'firstName': data.firstName,
      'middleName': data.middleName,
      'suffix': data.suffix || '',
      'birthdate': data.birthdate,
      'age': String(data.age),
      'sex': data.sex,
      'placeOfBirth': data.placeOfBirth,
      'address': data.address,
      'contact': data.contactNumber,
      'email': data.email,
      'school': data.schoolName,
      'course': data.course,
      'yearLevel': data.yearLevel,
    };

    for (const [fieldName, value] of Object.entries(fieldMapping)) {
      try {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(value);
        }
      } catch (_e) {
        // Field not found or not a text field, skip
        console.warn(`Field ${fieldName} not found in PDF form`);
      }
    }

    // Flatten form to make it non-editable
    form.flatten();

    const resultPdfBytes = await pdfDoc.save();
    return resultPdfBytes;
  } catch (error) {
    console.error('Error filling PDF form:', error);
    throw error;
  }
}
