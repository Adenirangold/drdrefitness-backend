// emailTemplates.ts

export const generateResetPasswordEmail = (
  name: string,
  resetToken: string
) => {
  return {
    subject: "Reset Your Drdrefitness Account Password",
    text: `
Hello ${name},

We received a request to reset your password. If you didn't request this, please ignore this email. Otherwise, click the link below to reset your password:

  http://localhost:3000/reset-password/${resetToken}

This link will expire in 10 minutes for security reasons. After that, you will need to request another reset.

If you have any questions or need further assistance, feel free to reply to this email.

Thank you.
    `,
  };
};

export const generateWelcomeEmail = (name: string) => {
  return {
    subject: "Welcome to Drdrefitness",
    text: `
  Hello ${name},
  
  Welcome to Drdrefitness! We're excited to have you as a member. Please feel free to explore your dashboard where you can monitor your details and member subscription.
  
  If you have any questions or need assistance, don't hesitate to reach out.
  
  Best regards,
  Drdrefitness Team`,
  };
};
