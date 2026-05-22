const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// ─── Transporter ─────────────────────────────────────────────────────────────

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || 'apikey',
      pass: process.env.SMTP_PASS || 'fake_pass_for_dev'
    }
  });
};

// ─── Core Send Function ───────────────────────────────────────────────────────

const sendEmail = async (to, subject, html, textFallback = '') => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Deployra <noreply@deployra.com>',
      to,
      subject,
      html,
      text: textFallback
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email sending failed to ${to}:`, error.message);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      logger.warn('Skipping email error in development mode.');
    }
  }
};

// ─── Shared Email Shell ───────────────────────────────────────────────────────
// A responsive, dark-mode-aware base shell that wraps all email content.

const emailShell = (content, previewText = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Deployra</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0a0a0a; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
    .btn-primary:hover { background-color: #0d7300 !important; }
  </style>
</head>
<body style="background-color:#0a0a0a; margin:0; padding:0; font-family:'Inter',Arial,sans-serif;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#108a00,#0d7300);border-radius:12px;padding:10px 18px;">
                    <span style="font-family:'Inter',Arial,sans-serif;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Deployra</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="background:linear-gradient(135deg,#111111,#161616);border:1px solid #222222;border-radius:20px;padding:48px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#444444;margin:0;line-height:1.6;">
                You received this email because you have an account on 
                <a href="https://deployra.vercel.app" style="color:#108a00;text-decoration:none;">deployra.vercel.app</a>.
              </p>
              <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#333333;margin:8px 0 0 0;">
                © ${new Date().getFullYear()} Deployra · AI Solutions Marketplace
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Shared Components ────────────────────────────────────────────────────────

const primaryButton = (href, text) => `
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding:32px 0;">
        <a href="${href}" class="btn-primary" style="background:linear-gradient(135deg,#108a00,#0d7300);color:#ffffff;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:9999px;display:inline-block;letter-spacing:-0.2px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

const divider = () => `<hr style="border:0;border-top:1px solid #222222;margin:32px 0;" />`;

const urlFallback = (url) => `
  <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;word-break:break-all;margin:0;">
    Or copy and paste this URL into your browser:<br/>
    <a href="${url}" style="color:#108a00;text-decoration:underline;">${url}</a>
  </p>
`;

const infoBox = (text) => `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;margin:24px 0;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#888888;margin:0;line-height:1.6;">${text}</p>
      </td>
    </tr>
  </table>
`;

const alertBox = (text, type = 'warning') => {
  const colors = { warning: '#f59e0b', error: '#ef4444', info: '#108a00' };
  const color = colors[type] || colors.warning;
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${color}12;border:1px solid ${color}33;border-radius:12px;margin:24px 0;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:${color};margin:0;line-height:1.6;">${text}</p>
        </td>
      </tr>
    </table>
  `;
};

// ─── 1. Welcome Email ─────────────────────────────────────────────────────────

const sendWelcomeEmail = async (to, name) => {
  const firstName = name?.split(' ')[0] || name || 'there';
  const subject = `Welcome to Deployra, ${firstName}! 🚀`;

  const content = `
    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;">
      Welcome aboard, ${firstName}! 🎉
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;color:#888888;margin:0 0 32px 0;line-height:1.6;">
      Your account has been created. You're now part of the Deployra ecosystem.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#cccccc;line-height:1.7;margin:0 0 24px 0;">
      Deployra is the marketplace where businesses discover and instantly deploy AI solutions — from customer support bots to marketing automation and beyond.
    </p>

    <!-- Feature Cards -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
      <tr>
        <td style="padding-bottom:12px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #222222;border-radius:12px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;margin:0 0 4px 0;">⚡ Instant AI Deployments</p>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#666666;margin:0;line-height:1.5;">Go live in minutes with pre-built, production-ready AI tools.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:12px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #222222;border-radius:12px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;margin:0 0 4px 0;">🎯 Custom Solutions</p>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#666666;margin:0;line-height:1.5;">Work with vetted developers for tailored AI solutions to your exact needs.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #222222;border-radius:12px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;margin:0 0 4px 0;">🛡️ Secure & Trusted</p>
                <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#666666;margin:0;line-height:1.5;">Every solution is reviewed and secured before listing on the marketplace.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${primaryButton('https://deployra.vercel.app', 'Explore the Marketplace →')}

    ${divider()}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#555555;margin:0;line-height:1.6;">
      Need help getting started? Reply to this email or visit our support centre.<br/>
      We're here for you.
    </p>
  `;

  const html = emailShell(content, `Welcome to Deployra, ${firstName}! Your account is ready.`);
  return sendEmail(to, subject, html, `Welcome to Deployra, ${firstName}! Your account is ready.`);
};

// ─── 2. Email Verification ────────────────────────────────────────────────────

const sendEmailVerificationEmail = async (to, name, verifyUrl) => {
  const firstName = name?.split(' ')[0] || name || 'there';
  const subject = 'Verify your Deployra email address';

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#108a0020;border:1px solid #108a0040;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">
        ✉️
      </div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;text-align:center;">
      Verify your email address
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px 0;line-height:1.6;text-align:center;">
      Hi ${firstName}, confirm your email to activate all features.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 8px 0;">
      Click the button below to verify your email address. This link expires in <strong style="color:#ffffff;">24 hours</strong>.
    </p>

    ${primaryButton(verifyUrl, 'Verify Email Address')}

    ${infoBox('If you did not create a Deployra account, you can safely ignore this email.')}

    ${divider()}
    ${urlFallback(verifyUrl)}
  `;

  const html = emailShell(content, `${firstName}, please verify your Deployra email address.`);
  return sendEmail(to, subject, html);
};

// ─── 3. Password Reset ────────────────────────────────────────────────────────

const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const firstName = name?.split(' ')[0] || name || 'there';
  const subject = 'Reset your Deployra password';

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#f59e0b20;border:1px solid #f59e0b40;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">
        🔑
      </div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;text-align:center;">
      Reset your password
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px 0;line-height:1.6;text-align:center;">
      Hi ${firstName}, we received a request to reset your password.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 8px 0;">
      Click the button below to choose a new password. This link is valid for <strong style="color:#ffffff;">1 hour</strong> and can only be used once.
    </p>

    ${primaryButton(resetUrl, 'Reset Password')}

    ${alertBox('If you did not request a password reset, please ignore this email. Your password will remain unchanged. If you believe your account is at risk, contact us immediately.', 'warning')}

    ${divider()}
    ${urlFallback(resetUrl)}
  `;

  const html = emailShell(content, 'Reset your Deployra password using this secure link.');
  return sendEmail(to, subject, html, `Reset your password: ${resetUrl}`);
};

// ─── 4. Password Changed Confirmation ────────────────────────────────────────

const sendPasswordChangedEmail = async (to, name, ipAddress = 'Unknown') => {
  const firstName = name?.split(' ')[0] || name || 'there';
  const subject = 'Your Deployra password was changed';
  const changedAt = new Date().toUTCString();

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#108a0020;border:1px solid #108a0040;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">
        🛡️
      </div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;text-align:center;">
      Password successfully changed
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px 0;line-height:1.6;text-align:center;">
      Hi ${firstName}, your Deployra password has been updated.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 24px 0;">
      Your password was successfully changed on your account. Here are the details:
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #222222;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom:10px;">
                <span style="font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">Time</span><br/>
                <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#cccccc;">${changedAt}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style="font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">IP Address</span><br/>
                <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#cccccc;">${ipAddress}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${alertBox('If you did NOT make this change, your account may be compromised. <strong>Reset your password immediately</strong> and contact our support team.', 'error')}

    ${primaryButton('https://deployra.vercel.app/auth?tab=forgot', 'Secure My Account')}
  `;

  const html = emailShell(content, 'Your Deployra password was recently changed.');
  return sendEmail(to, subject, html);
};

// ─── 5. Security Alert (New Login / Suspicious Activity) ─────────────────────

const sendSecurityAlertEmail = async (to, name, details = {}) => {
  const firstName = name?.split(' ')[0] || name || 'there';
  const subject = '⚠️ New login to your Deployra account';
  const {
    ipAddress = 'Unknown',
    userAgent = 'Unknown browser',
    location = 'Unknown location',
    time = new Date().toUTCString()
  } = details;

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#f59e0b20;border:1px solid #f59e0b40;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">
        ⚠️
      </div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;text-align:center;">
      New sign-in detected
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px 0;line-height:1.6;text-align:center;">
      Hi ${firstName}, a new sign-in to your account was detected.
    </p>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 24px 0;">
      We noticed a successful login to your Deployra account. Here are the details:
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #222222;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding-bottom:14px;border-bottom:1px solid #252525;">
              <span style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">Time</span><br/>
              <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#cccccc;margin-top:4px;display:block;">${time}</span>
            </td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid #252525;">
              <span style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">IP Address</span><br/>
              <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#cccccc;margin-top:4px;display:block;">${ipAddress}</span>
            </td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid #252525;">
              <span style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">Location</span><br/>
              <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#cccccc;margin-top:4px;display:block;">${location}</span>
            </td></tr>
            <tr><td style="padding-top:14px;">
              <span style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;">Device</span><br/>
              <span style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#cccccc;margin-top:4px;display:block;">${userAgent}</span>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#888888;margin:0 0 24px 0;line-height:1.6;">
      ✅ If this was you, no action is needed. You can safely ignore this email.
    </p>

    ${alertBox('If you did NOT sign in, your password may be compromised. Change it immediately and revoke all active sessions.', 'error')}

    ${primaryButton('https://deployra.vercel.app/auth?tab=forgot', 'Secure My Account Now')}
  `;

  const html = emailShell(content, 'A new sign-in was detected on your Deployra account.');
  return sendEmail(to, subject, html);
};

// ─── 6. Purchase Confirmation ─────────────────────────────────────────────────

const sendPurchaseConfirmation = async (to, name, details = {}) => {
  const firstName = name?.split(' ')[0] || name || 'there';
  const subject = `Order Confirmed – ${details.productTitle || 'Your Purchase'}`;

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#108a0020;border:1px solid #108a0040;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">
        ✅
      </div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px 0;letter-spacing:-0.5px;text-align:center;">
      Your order is confirmed!
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px 0;line-height:1.6;text-align:center;">
      Thanks for your purchase, ${firstName}. Here's your order summary.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#1a1a1a;border:1px solid #222222;border-radius:12px;margin-bottom:32px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px 0;">Product</p>
          <p style="font-family:'Inter',Arial,sans-serif;font-size:18px;font-weight:700;color:#ffffff;margin:0 0 20px 0;">${details.productTitle || 'AI Solution'}</p>
          <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:600;color:#555555;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px 0;">Amount Paid</p>
          <p style="font-family:'Inter',Arial,sans-serif;font-size:28px;font-weight:700;color:#108a00;margin:0;">${details.amount ? `₹${details.amount}` : 'Confirmed'}</p>
        </td>
      </tr>
    </table>

    ${primaryButton('https://deployra.vercel.app', 'View Your Dashboard →')}
  `;

  const html = emailShell(content, `Your Deployra order for ${details.productTitle || 'your purchase'} is confirmed.`);
  return sendEmail(to, subject, html);
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendSecurityAlertEmail,
  sendPurchaseConfirmation
};
