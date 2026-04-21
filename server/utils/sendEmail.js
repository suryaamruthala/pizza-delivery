const nodemailer = require('nodemailer');
const axios = require('axios');

const sendEmail = async (options) => {
  // ── Primary: Gmail SMTP via Nodemailer ─────────────────────────────────────
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_APP_PASSWORD;

  if (smtpEmail && smtpPassword) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpEmail, pass: smtpPassword },
    });

    await transporter.sendMail({
      from: `"SliceStream 🍕" <${smtpEmail}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log('\n========================================================');
    console.log('📧 EMAIL SENT VIA GMAIL SMTP:');
    console.log(`➡️  To: ${options.email}`);
    console.log(`➡️  Subject: ${options.subject}`);
    console.log('========================================================\n');
    return;
  }

  // ── Fallback: EmailJS ──────────────────────────────────────────────────────
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      await axios.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        {
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: {
            to_email: options.email,
            email: options.email,
            to: options.email,
            reply_to: options.email,
            subject: options.subject,
            message_html: options.html,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }
      );

      console.log('\n========================================================');
      console.log('📧 EMAIL SENT VIA EMAILJS:');
      console.log(`➡️  To: ${options.email}`);
      console.log(`➡️  Subject: ${options.subject}`);
      console.log('⚠️  Note: If not received, check EmailJS template "To Email" field uses {{to_email}}');
      console.log('========================================================\n');
      return;
    } catch (error) {
      console.error('EmailJS Error:', error.response ? error.response.data : error.message);
      throw new Error('Email could not be sent');
    }
  }

  console.warn('\n⚠️  No email provider configured. Add SMTP_EMAIL + SMTP_APP_PASSWORD to .env\n');
};

module.exports = sendEmail;
