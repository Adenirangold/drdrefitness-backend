import mailgun from "mailgun.js";
import formData from "form-data";
import {
  generateResetPasswordEmail,
  generateWelcomeEmail,
} from "./emailTemplate";

const mg = new mailgun(formData).client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

const sendEmail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: "Mailgun Sandbox <postmaster@sandbox6f8bb940a3fd4ec09ffbb8994a12bde2.mailgun.org>",
      to: [to],
      subject,
      text,
    });
    return result;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (
  to: string,
  name: string,
  resetToken: string
) => {
  const { subject, text } = generateResetPasswordEmail(name, resetToken);
  return sendEmail({ to, subject, text });
};

// Function to send a welcome email
export const sendWelcomeEmail = async (to: string, name: string) => {
  const { subject, text } = generateWelcomeEmail(name);
  return sendEmail({ to, subject, text });
};

export default sendEmail;
