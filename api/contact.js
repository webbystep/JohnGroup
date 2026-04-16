// Vercel Serverless Function – quote request handler using Resend HTTP API.
// Required env vars (set in Vercel project settings):
//   RESEND_API_KEY  – your Resend API key
//   RESEND_FROM     – verified sender (e.g. "John Group <noreply@yourdomain.com>")
//                     For testing you can use "onboarding@resend.dev"
//   RESEND_TO       – recipient mailbox (e.g. "office@johnslovakia.sk")

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

const SUBJECTS = {
  hu: function (name) { return 'Új ajánlatkérés – ' + name; },
  en: function (name) { return 'New quote request – ' + name; },
  de: function (name) { return 'Neue Angebotsanfrage – ' + name; },
};

const LABELS = {
  hu: { name: 'Név', email: 'E-mail', phone: 'Telefon', message: 'Üzenet', lang: 'Nyelv', page: 'Oldal', heading: 'Új ajánlatkérés' },
  en: { name: 'Name', email: 'Email', phone: 'Phone', message: 'Message', lang: 'Language', page: 'Page', heading: 'New quote request' },
  de: { name: 'Name', email: 'E-Mail', phone: 'Telefon', message: 'Nachricht', lang: 'Sprache', page: 'Seite', heading: 'Neue Angebotsanfrage' },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_TO || 'office@johnslovakia.sk';

  if (!apiKey || !from) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM env var');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing request body' });
  }

  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const phone = (body.phone || '').toString().trim();
  const message = (body.message || '').toString().trim();
  const rawLang = (body.lang || 'hu').toString().toLowerCase().slice(0, 2);
  const lang = LABELS[rawLang] ? rawLang : 'hu';
  const page = (body.page || '').toString().slice(0, 200);

  if (!name || name.length > 200) return res.status(400).json({ error: 'Invalid name' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email' });
  if (!phone || phone.length > 50) return res.status(400).json({ error: 'Invalid phone' });
  if (!message || message.length > 5000) return res.status(400).json({ error: 'Invalid message' });

  const labels = LABELS[lang];
  const subject = SUBJECTS[lang](name);

  const html =
    '<div style="font-family:Inter,Arial,sans-serif;color:#1f3444;max-width:600px;margin:0 auto;">' +
    '<h2 style="color:#162734;border-bottom:2px solid #00ace8;padding-bottom:8px;">' + labels.heading + '</h2>' +
    '<table style="width:100%;border-collapse:collapse;margin-top:16px;">' +
    '<tr><td style="padding:8px 0;font-weight:600;width:120px;">' + labels.name + ':</td><td style="padding:8px 0;">' + escapeHtml(name) + '</td></tr>' +
    '<tr><td style="padding:8px 0;font-weight:600;">' + labels.email + ':</td><td style="padding:8px 0;"><a href="mailto:' + encodeURI(email) + '">' + escapeHtml(email) + '</a></td></tr>' +
    '<tr><td style="padding:8px 0;font-weight:600;">' + labels.phone + ':</td><td style="padding:8px 0;"><a href="tel:' + encodeURI(phone) + '">' + escapeHtml(phone) + '</a></td></tr>' +
    '<tr><td style="padding:8px 0;font-weight:600;">' + labels.lang + ':</td><td style="padding:8px 0;">' + lang.toUpperCase() + '</td></tr>' +
    (page ? '<tr><td style="padding:8px 0;font-weight:600;">' + labels.page + ':</td><td style="padding:8px 0;">' + escapeHtml(page) + '</td></tr>' : '') +
    '</table>' +
    '<h3 style="margin-top:24px;color:#162734;">' + labels.message + '</h3>' +
    '<p style="white-space:pre-wrap;background:#f2f5fb;padding:16px;border-left:3px solid #00ace8;">' + escapeHtml(message) + '</p>' +
    '</div>';

  const text =
    labels.heading + '\n\n' +
    labels.name + ': ' + name + '\n' +
    labels.email + ': ' + email + '\n' +
    labels.phone + ': ' + phone + '\n' +
    labels.lang + ': ' + lang.toUpperCase() + '\n' +
    (page ? labels.page + ': ' + page + '\n' : '') +
    '\n' + labels.message + ':\n' + message;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from,
        to: to,
        reply_to: email,
        subject: subject,
        html: html,
        text: text,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', resendRes.status, err);
      return res.status(502).json({ error: 'Email provider error' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
