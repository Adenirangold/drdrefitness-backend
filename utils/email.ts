import mailgun from "mailgun.js";
import formData from "form-data";

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
export default sendEmail;
