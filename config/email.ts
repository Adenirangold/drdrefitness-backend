import mailgun from "mailgun.js";
import formData from "form-data";
import {
  generateResetPasswordEmail,
  generateResubscriptionEmail,
  generateSubscriptionInvitationEmail,
  generateWelcomeEmail,
} from "../utils/emailTemplate";
import { GroupSupscriptionEmail } from "../types";

const mg = new mailgun(formData).client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: "Mailgun Sandbox <postmaster@sandbox6f8bb940a3fd4ec09ffbb8994a12bde2.mailgun.org>",
      to: [to],
      subject,
      text,
      html,
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
  const { subject, text, html } = generateResetPasswordEmail(name, resetToken);
  return sendEmail({ to, subject, text, html });
};

// Function to send a welcome email
export const sendWelcomeEmail = async (to: string, name: string) => {
  const { subject, text, html } = generateWelcomeEmail(name);
  return sendEmail({ to, subject, text, html });
};

export const sendSubscriptionEmail = async (
  to: string,
  name: string,
  packageName: string,
  endDate: string,
  daysDuration: number
) => {
  const { subject, text, html } = generateResubscriptionEmail(
    name,
    packageName,
    endDate,
    daysDuration
  );
  return sendEmail({ to, subject, text, html });
};

export const sendGroupInvitationEmail = async ({
  inviterName,
  inviteeEmail,
  planName,
  planEndDate,
  planLocation,
  planBranch,
  inviteLink,
}: GroupSupscriptionEmail) => {
  const { subject, text, html } = generateSubscriptionInvitationEmail(
    inviterName,
    inviteeEmail,
    planName,
    planEndDate,
    planLocation,
    planBranch,
    inviteLink
  );
  return sendEmail({ to: inviteeEmail, subject, text, html });
};
export default sendEmail;
