import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    throw new Error("SMTP_HOST is required for sending email");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || "info@jnvtaa.in";
  const transport = getTransporter();

  return transport.sendMail({
    from,
    to,
    subject,
    html,
    text: text || html?.replace(/<[^>]+>/g, ""),
  });
}

export async function sendNewsletterConfirmation(email, confirmUrl) {
  return sendEmail({
    to: email,
    subject: "Confirm your JNVTAA newsletter subscription",
    html: `
      <p>Thank you for subscribing to JNVTAA updates.</p>
      <p><a href="${confirmUrl}">Confirm your subscription</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}

export async function sendNewsletterCampaign(email, subject, body) {
  return sendEmail({
    to: email,
    subject,
    html: body,
  });
}

export async function sendRegistrationEmail(user) {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
  const isGoogleUser = Boolean(user.googleId);
  const nextStepNote = isGoogleUser
    ? "<p>Your account is active and ready to use.</p>"
    : "<p>An admin will review and verify your account shortly. You will receive another email once your account is verified.</p>";

  return sendEmail({
    to: user.email,
    subject: "Welcome to JNVTAA — Registration successful",
    html: `
      <p>Hi ${user.firstName},</p>
      <p>Thank you for registering with JNVTAA. Your account has been created successfully.</p>
      ${nextStepNote}
      <p><a href="${frontendUrl}">Visit JNVTAA</a></p>
    `,
    text: `Hi ${user.firstName}, thank you for registering with JNVTAA. Your account has been created successfully.`,
  });
}

export async function sendVerificationEmail(user) {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );

  return sendEmail({
    to: user.email,
    subject: "Your JNVTAA account has been verified",
    html: `
      <p>Hi ${user.firstName},</p>
      <p>Your JNVTAA account has been verified. You now have full access to the alumni platform.</p>
      <p><a href="${frontendUrl}/dashboard">Go to your dashboard</a></p>
    `,
    text: `Hi ${user.firstName}, your JNVTAA account has been verified. You now have full access to the alumni platform.`,
  });
}

export async function sendPasswordResetEmail(user, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  return sendEmail({
    to: user.email,
    subject: "JNVTAA Password Reset",
    html: `
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset for your JNVTAA account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

export default sendEmail;
