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



// ─── 5. Product Submission — Admin Notification ───────────────────────────────

const sendProductSubmissionNotification = async (adminEmail, product, developer) => {
  const subject = `[Deployra] New Product Submission Requires Review`;
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });

  const configFields = (() => {
    try { return product.configSchema ? JSON.parse(product.configSchema) : []; } catch { return []; }
  })();

  const configRows = configFields.length > 0
    ? configFields.map(f => `
        <tr>
          <td style="padding:6px 12px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#aaaaaa;border-bottom:1px solid #1e1e1e;">${f.label || 'Untitled'}</td>
          <td style="padding:6px 12px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#888888;border-bottom:1px solid #1e1e1e;">${f.type}</td>
          <td style="padding:6px 12px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#888888;border-bottom:1px solid #1e1e1e;">${f.required ? 'Required' : 'Optional'}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:10px 12px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#555555;text-align:center;">No config fields defined</td></tr>`;

  const screenshotPreviews = (product.screenshots || []).slice(0, 3).map(url =>
    `<a href="${url}" style="display:inline-block;margin:4px;"><img src="${url}" width="120" height="80" style="object-fit:cover;border-radius:6px;border:1px solid #2a2a2a;" /></a>`
  ).join('');

  const content = `
    <div style="display:inline-flex;align-items:center;gap:10px;background:#f59e0b18;border:1px solid #f59e0b40;border-radius:12px;padding:12px 20px;margin-bottom:24px;">
      <span style="font-size:22px;">🔔</span>
      <div>
        <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:#f59e0b;margin:0;">New Product Requires Your Review</p>
        <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#f59e0b99;margin:2px 0 0;">Submitted on ${submittedAt}</p>
      </div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:24px;font-weight:700;color:#ffffff;margin:0 0 4px;letter-spacing:-0.5px;">${product.title}</h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#888888;margin:0 0 28px;">${product.shortDesc || product.description?.slice(0, 120) + '...'}</p>

    <!-- Product Details Grid -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#161616;border:1px solid #2a2a2a;border-radius:14px;margin-bottom:24px;overflow:hidden;">
      <tr style="background:#1a1a1a;border-bottom:1px solid #222;">
        <td colspan="2" style="padding:12px 20px;font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;">Product Details</td>
      </tr>
      ${[
        ['Category', product.category || '—'],
        ['Price', `₹${Number(product.price).toLocaleString('en-IN')}`],
        ['Delivery Time', `${product.deliveryDays || 7} days`],
        ['Support Duration', product.support || '—'],
        ['Deployment Method', product.deploymentMethod || '—'],
        ['Demo URL', product.demoUrl ? `<a href="${product.demoUrl}" style="color:#108a00;">${product.demoUrl}</a>` : '—'],
        ['Documentation', product.docsUrl ? `<a href="${product.docsUrl}" style="color:#108a00;">${product.docsUrl}</a>` : '—'],
        ['Tags', (product.tags || []).join(', ') || '—'],
        ['Features', (product.features || []).slice(0, 5).join(', ') || '—'],
      ].map(([label, value], i) => `
        <tr style="${i % 2 === 0 ? 'background:#161616;' : 'background:#181818;'}">
          <td style="padding:10px 20px;font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:600;color:#666666;width:180px;">${label}</td>
          <td style="padding:10px 20px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#cccccc;">${value}</td>
        </tr>`).join('')}
    </table>

    <!-- Developer Details -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#161616;border:1px solid #2a2a2a;border-radius:14px;margin-bottom:24px;overflow:hidden;">
      <tr style="background:#1a1a1a;border-bottom:1px solid #222;">
        <td colspan="2" style="padding:12px 20px;font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;">Developer Information</td>
      </tr>
      ${[
        ['Name', developer?.name || '—'],
        ['Email', developer?.email || '—'],
        ['Developer ID', developer?.id || '—'],
      ].map(([label, value], i) => `
        <tr style="${i % 2 === 0 ? 'background:#161616;' : 'background:#181818;'}">
          <td style="padding:10px 20px;font-family:'Inter',Arial,sans-serif;font-size:12px;font-weight:600;color:#666666;width:180px;">${label}</td>
          <td style="padding:10px 20px;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#cccccc;">${value}</td>
        </tr>`).join('')}
    </table>

    <!-- Screenshots -->
    ${screenshotPreviews ? `
    <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Screenshots</p>
    <div style="margin-bottom:24px;">${screenshotPreviews}</div>` : ''}

    <!-- Config Schema -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#161616;border:1px solid #2a2a2a;border-radius:14px;margin-bottom:28px;overflow:hidden;">
      <tr style="background:#1a1a1a;border-bottom:1px solid #222;">
        <td style="padding:12px 20px;font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;">Config Builder Schema (${configFields.length} fields)</td>
        <td style="padding:12px 20px;font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;text-align:right;">TYPE</td>
        <td style="padding:12px 20px;font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;text-align:right;">REQUIRED</td>
      </tr>
      ${configRows}
    </table>

    <!-- Full Description -->
    <p style="font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;color:#555555;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Full Description</p>
    <div style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#aaaaaa;margin:0;line-height:1.7;">${product.description}</p>
    </div>

    ${primaryButton('https://deployra.vercel.app/admin', '→ Open Admin Review Center')}

    ${alertBox('This product is currently in PENDING_REVIEW status and is NOT visible on the marketplace. It will only go live after your approval.', 'warning')}
  `;

  const html = emailShell(content, `New product submission: "${product.title}" awaits your review.`);
  return sendEmail(adminEmail, subject, html);
};

// ─── 6. Product Approved — Developer Notification ──────────────────────────────

const sendProductApprovedEmail = async (developerEmail, developerName, productTitle) => {
  const firstName = developerName?.split(' ')[0] || 'Developer';
  const subject = `🎉 Your product "${productTitle}" is now LIVE on Deployra!`;

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#108a0020;border:2px solid #108a0040;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:32px;">🚀</div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px;letter-spacing:-0.5px;text-align:center;">
      Your product is LIVE!
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px;line-height:1.6;text-align:center;">
      Congratulations, ${firstName}! The Deployra team has reviewed and approved your submission.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#108a0012;border:1px solid #108a0030;border-radius:14px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="font-family:'Inter',Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;margin:0 0 4px;">${productTitle}</p>
          <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#108a00;margin:0;">✓ APPROVED · Now discoverable by all marketplace visitors</p>
        </td>
      </tr>
    </table>

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 8px;">
      Your product is now:
    </p>
    <ul style="font-family:'Inter',Arial,sans-serif;font-size:14px;color:#888888;line-height:2;padding-left:20px;margin:0 0 28px;">
      <li>Visible on the Deployra marketplace</li>
      <li>Discoverable through search and category pages</li>
      <li>Listed on your developer profile</li>
      <li>Purchasable by businesses worldwide</li>
    </ul>

    ${primaryButton('https://deployra.vercel.app/developer/listings', 'View Your Listings →')}

    ${divider()}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:13px;color:#555555;margin:0;line-height:1.6;">
      Share your product link with potential buyers to drive your first sales!<br/>
      For any questions, reply to this email or visit our developer hub.
    </p>
  `;

  const html = emailShell(content, `Your product "${productTitle}" is now live on Deployra!`);
  return sendEmail(developerEmail, subject, html);
};

// ─── 7. Product Rejected — Developer Notification ──────────────────────────────

const sendProductRejectedEmail = async (developerEmail, developerName, productTitle, reason) => {
  const firstName = developerName?.split(' ')[0] || 'Developer';
  const subject = `Action Required: Your Deployra product submission needs changes`;

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#ef444420;border:2px solid #ef444440;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:32px;">📋</div>
    </div>

    <h1 style="font-family:'Inter',Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;margin:0 0 8px;letter-spacing:-0.5px;text-align:center;">
      Your submission needs changes
    </h1>
    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#888888;margin:0 0 32px;line-height:1.6;text-align:center;">
      Hi ${firstName}, our review team has reviewed your product submission and found some issues that need to be addressed before it can go live.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#161616;border:1px solid #2a2a2a;border-radius:14px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="font-family:'Inter',Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;margin:0 0 4px;">${productTitle}</p>
          <p style="font-family:'Inter',Arial,sans-serif;font-size:12px;color:#ef4444;margin:0;">Status: Needs Changes</p>
        </td>
      </tr>
    </table>

    ${alertBox(`<strong style="display:block;margin-bottom:8px;font-size:13px;">Review Feedback:</strong>${reason}`, 'error')}

    <p style="font-family:'Inter',Arial,sans-serif;font-size:15px;color:#aaaaaa;line-height:1.7;margin:0 0 24px;">
      <strong style="color:#ffffff;">What to do next:</strong><br/>
      1. Log in to your Deployra developer account<br/>
      2. Navigate to <strong style="color:#ffffff;">My Listings</strong><br/>
      3. Click <strong style="color:#ffffff;">Fix &amp; Resubmit</strong> on the product<br/>
      4. Address the feedback above and resubmit for review
    </p>

    ${primaryButton('https://deployra.vercel.app/developer/listings', 'Fix & Resubmit →')}

    ${divider()}

    ${infoBox('Your product is NOT deleted. It remains in your listings as "Needs Changes" and you can resubmit as many times as needed. Our team will re-review it promptly.')}
  `;

  const html = emailShell(content, `Your product "${productTitle}" submission needs changes.`);
  return sendEmail(developerEmail, subject, html);
};


// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendProductSubmissionNotification,
  sendProductApprovedEmail,
  sendProductRejectedEmail,
};
