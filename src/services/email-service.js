import nodemailer from "nodemailer";

export const emailService = {
  sendPasswordResetEmail: async (email, token) => {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials missing in .env. Email not sent.");
        return null;
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const resetLink = `http://localhost:5173/reset-password?token=${token}`;

      const info = await transporter.sendMail({
        from: "\"Discover Regensburg\" <no-reply@discover-regensburg.com>",
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please use this link to reset your password: ${resetLink}. This link expires in 1 hour.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #ff6b35;">Password Reset</h2>
            <p>You requested a password reset for your Discover Regensburg account.</p>
            <p>Please click the link below to verify your token and set a new password:</p>
            <p>
              <a href="${resetLink}" style="background-color: #ff6b35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </p>
            <p>Or verify using this token manually: <strong>${token}</strong></p>
            <p>This link expires in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      console.log("Message sent to %s via SMTP. MessageId: %s", email, info.messageId);
      return true;

    } catch (error) {
      console.error("Error sending email:", error);
      return null;
    }
  },
};
