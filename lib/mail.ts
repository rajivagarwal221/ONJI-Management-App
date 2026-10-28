// Gmail SMTP sender via nodemailer.
// Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local
// (App Password from https://myaccount.google.com/apppasswords, 2FA required).
import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function transporter() {
  if (cached) return cached;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "Gmail credentials missing. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.",
    );
  }
  cached = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cached;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const info = await transporter().sendMail({
    from: `"ONJI Internship" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return info.messageId;
}

export function credentialEmail(
  name: string,
  email: string,
  password: string,
  referenceNo: string,
  loginUrl: string,
) {
  const text = `Hi ${name},

Welcome to the ONJI Internship. Your account is ready.

Reference No.: ${referenceNo}
Login URL:      ${loginUrl}
Email:          ${email}
Password:       ${password}

For security, you can only be signed in on one device at a time. Signing in on a new device will sign you out on the previous one.

See you inside,
The ONJI team`;

  const html = `
<div style="font-family:Inter,Arial,sans-serif;color:#2A1D13;background:#FBF7F0;padding:32px">
  <table style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E8DECF;border-radius:14px;padding:28px">
    <tr><td>
      <div style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#A4521E">ONJI Internship</div>
      <p style="margin-top:16px;font-size:15px;line-height:1.6">Hi ${name},</p>
      <p style="font-size:15px;line-height:1.6">Welcome to the ONJI Internship. Your account is ready.</p>
      <table style="width:100%;margin:20px 0;border-collapse:collapse">
        <tr><td style="padding:8px 0;font-size:13px;color:#6B5947;width:140px">Reference No.</td><td style="font-size:14px;font-weight:600">${referenceNo}</td></tr>
        <tr><td style="padding:8px 0;font-size:13px;color:#6B5947">Email</td><td style="font-size:14px">${email}</td></tr>
        <tr><td style="padding:8px 0;font-size:13px;color:#6B5947">Password</td><td style="font-size:14px;font-family:ui-monospace,monospace;background:#F5EEE2;padding:4px 8px;border-radius:6px;display:inline-block">${password}</td></tr>
      </table>
      <p><a href="${loginUrl}" style="display:inline-block;background:#B4601F;color:#FFFFFF;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600">Sign in to the portal</a></p>
      <p style="margin-top:24px;font-size:12px;color:#6B5947">For security, you can only be signed in on one device at a time. Signing in on a new device will sign you out of the previous one.</p>
      <p style="font-size:13px;color:#6B5947">— The ONJI team</p>
    </td></tr>
  </table>
</div>`;

  return { subject: "Your ONJI Internship account", text, html };
}
