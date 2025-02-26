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
    html: `
<!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 1px solid #eeeeee;
          }
          .content {
              padding: 30px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4CAF50;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
          }
          .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eeeeee;
              color: #666666;
              font-size: 14px;
          }
          .note {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
              font-size: 14px;
              color: #666666;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Password Reset Request</h2>
          </div>
          
          <div class="content">
              <p>Hello ${name},</p>
              
              <p>We received a request to reset your password for your Drdrefitness account. If you didn't make this request, you can safely ignore this email.</p>
              
              <div style="text-align: center;">
                  <a href="http://localhost:3000/reset-password/${resetToken}" class="button">Reset Password</a>
              </div>
              
              <div class="note">
                  <strong>Note:</strong> This link will expire in 10 minutes for security reasons. After that, you'll need to request another reset.
              </div>
              
              <p>If you have any questions or need assistance, feel free to reply to this email. We're here to help!</p>
          </div>
          
          <div class="footer">
              <p>This email was sent by Drdrefitness</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
          </div>
      </div>
  </body>
  </html>
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
    html: `
  <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eeeeee;
        }
        .content {
            padding: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            color: #666666;
            font-size: 14px;
        }
        .welcome-message {
            text-align: center;
            font-size: 18px;
            margin: 20px 0;
            color: #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Welcome to Drdrefitness!</h2>
        </div>
        
        <div class="content">
            <p>Hello ${name},</p>
            
            <div class="welcome-message">
                <p>🎉 We're excited to have you as a member! 🎉</p>
            </div>
            
            <p>Your journey to better fitness starts here. You now have access to:</p>
            <ul style="padding-left: 20px;">
                <li>Personal dashboard</li>
                <li>Member subscription details</li>
                <li>Fitness tracking tools</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="http://localhost:3000/dashboard" class="button">View Your Dashboard</a>
            </div>
            
            <p>If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help you succeed!</p>
        </div>
        
        <div class="footer">
            <p>Best regards,</p>
            <p>Drdrefitness Team</p>
        </div>
    </div>
</body>
</html>
  `,
  };
};

export const generateResubscriptionEmail = (
  name: string,
  packageName: string,
  endDate: string,
  daysDuration: number
) => {
  return {
    subject: "Your Resubscription to Drdrefitness is Confirmed!",
    text: `
    Hello ${name},
    
    We're excited to inform you that your subscription has been successfully resubscribed. Thank you for continuing to be part of the Drdrefitness community!
  
    **Package Name:** ${packageName}
    **Subscription End Date:** ${endDate}
    **Subscription Duration:** ${daysDuration} days
  
    If you have any questions or need assistance, don't hesitate to reach out.
  
    Best regards,
    Drdrefitness Team`,
    html: `
    <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 1px solid #eeeeee;
          }
          .content {
              padding: 30px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4CAF50;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: bold;
          }
          .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eeeeee;
              color: #666666;
              font-size: 14px;
          }
          .welcome-message {
              text-align: center;
              font-size: 18px;
              margin: 20px 0;
              color: #4CAF50;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Your Resubscription is Confirmed!</h2>
          </div>
          
          <div class="content">
              <p>Hello ${name},</p>
              
              <div class="welcome-message">
                  <p>🎉 We're happy to have you back! 🎉</p>
              </div>
              
              <p>Your resubscription details are as follows:</p>
              <ul style="padding-left: 20px;">
                  <li><strong>Package Name:</strong> ${packageName}</li>
                  <li><strong>Subscription End Date:</strong> ${endDate}</li>
                  <li><strong>Subscription Duration:</strong> ${daysDuration} days</li>
              </ul>
              
              <p>To view or manage your subscription, visit your personal dashboard:</p>
              <div style="text-align: center;">
                  <a href="http://localhost:3000/dashboard" class="button">View Your Dashboard</a>
              </div>
              
              <p>If you have any questions or need assistance, our team is here to help. Don't hesitate to reach out!</p>
          </div>
          
          <div class="footer">
              <p>Best regards,</p>
              <p>Drdrefitness Team</p>
          </div>
      </div>
  </body>
  </html>
    `,
  };
};
