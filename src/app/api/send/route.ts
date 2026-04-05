import { EmailTemplate } from '@/email-template/sample'; // Update the import path if necessary based on your project structure
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      // Replace "Acme" with your desired sender name, and use any prefix with your verified domain
      from: 'PESO <noreply@jemgali.tech>', 
      // Replace with the actual recipient's email address
      to: ['delivered@resend.dev'], 
      subject: 'Hello world',
      react: EmailTemplate({ firstName: 'John' }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}