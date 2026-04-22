// Brand tokens — single source of truth for all email templates
export const BRAND = {
  primary: '#0052FF',
  primaryDark: '#003EC7',
  primaryLight: '#4F8EFF',
  surface: '#F0F4F8',
  card: '#ffffff',
  onSurface: '#0B1C30',
  onSurfaceVariant: '#434656',
  footer: '#6B7280',
  footerLink: '#0052FF',
  border: '#E0E7EF',
  warning: '#DC2626',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  // Solid fallbacks for rgba (Outlook doesn't support rgba)
  iconBgBlue: '#EBF0FF',
  iconBgAmber: '#FEF6E7',
  iconBgGreen: '#ECFDF3',
  iconBgRed: '#FEF2F2',
} as const

// ─── SVG Icons (Lucide-style, email-safe inline SVG) ──────────────────────────

export const ICONS = {
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  key: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
}

// ─── Spacer (email-safe, doesn't inflate) ─────────────────────────────────────

function spacer(height: number): string {
  return `<tr><td style="height:${height}px;font-size:${height}px;line-height:${height}px;">&nbsp;</td></tr>`
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface EmailLayoutOptions {
  previewText?: string
  children: string
  unsubscribeUrl?: string
}

export function emailLayout({
  previewText = '',
  children,
  unsubscribeUrl,
}: EmailLayoutOptions): string {
  const year = new Date().getFullYear()
  const previewPadding = '&zwnj;&nbsp;'.repeat(60)
  const appUrl = process.env.NEXTAUTH_URL ?? 'https://cryptoedy.com'

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <title>CryptoEdy</title>
  <style>
    body, table, td, p, a, h1, h2 { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media (prefers-color-scheme: dark) {
      .email-body    { background-color: #0D1520 !important; }
      .email-card    { background-color: #1B2A3D !important; }
      .email-heading { color: #F1F5F9 !important; }
      .email-para    { color: #94A3B8 !important; }
      .email-small   { color: #64748B !important; }
      .email-footer  { color: #475569 !important; }
    }
  </style>
</head>
<body class="email-body" style="margin:0;padding:0;background-color:${BRAND.surface};font-family:${BRAND.fontFamily};-webkit-font-smoothing:antialiased;">

  ${
    previewText
      ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}${previewPadding}</div>`
      : ''
  }

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:${BRAND.surface};">
    <!-- Top spacing -->
    ${spacer(40)}
    <tr>
      <td align="center" style="padding:0 16px;">
        <!-- Inner container -->
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;width:100%;">

          <!-- ═══ Card wrapper (single td with overflow:hidden clips the blue header) ═══ -->
          <tr>
            <td class="email-card"
              style="background:${BRAND.card};border-radius:16px;overflow:hidden;">

              <!-- Blue header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center"
                    style="background:${BRAND.primary};padding:24px 40px;">
                    <a href="${appUrl}" style="text-decoration:none;">
                      <span style="font-size:22px;font-weight:800;color:#ffffff;
                        letter-spacing:-0.04em;font-family:${BRAND.fontFamily};">CryptoEdy</span>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 40px 32px;">
                    ${children}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer spacing -->
          ${spacer(28)}

          <!-- ═══ Footer (on gray background) ═══ -->
          <tr>
            <td align="center" style="padding:0 40px;">
              <p class="email-footer" style="margin:0 0 4px;color:${BRAND.footer};font-size:13px;
                line-height:1.5;font-family:${BRAND.fontFamily};">
                &copy; ${year} CryptoEdy. All rights reserved.
              </p>
              <p class="email-footer" style="margin:0 0 14px;color:${BRAND.footer};font-size:12px;
                line-height:1.5;font-family:${BRAND.fontFamily};">
                You're receiving this because you have a CryptoEdy account.
              </p>
              <p style="margin:0;font-family:${BRAND.fontFamily};">
                <a href="${appUrl}/privacy" style="color:${BRAND.footerLink};font-size:12px;text-decoration:none;">Privacy Policy</a>
                <span style="color:${BRAND.footer};font-size:12px;padding:0 6px;">&middot;</span>
                <a href="${appUrl}/terms" style="color:${BRAND.footerLink};font-size:12px;text-decoration:none;">Terms of Service</a>
                <span style="color:${BRAND.footer};font-size:12px;padding:0 6px;">&middot;</span>
                <a href="mailto:support@cryptoedy.com" style="color:${BRAND.footerLink};font-size:12px;text-decoration:none;">Contact Support</a>
              </p>
              ${
                unsubscribeUrl
                  ? `<p style="margin:10px 0 0;font-family:${BRAND.fontFamily};">
                    <a href="${unsubscribeUrl}" style="color:${BRAND.footer};font-size:11px;
                      text-decoration:underline;">Manage notification preferences</a>
                  </p>`
                  : ''
              }
            </td>
          </tr>

          <!-- Bottom spacing -->
          ${spacer(40)}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Primitives ───────────────────────────────────────────────────────────────

export function heading(text: string): string {
  return `<h1 class="email-heading" style="margin:0 0 12px;color:${BRAND.onSurface};font-size:26px;
    font-weight:800;letter-spacing:-0.03em;line-height:1.25;font-family:${BRAND.fontFamily};">${text}</h1>`
}

export function paragraph(text: string): string {
  return `<p class="email-para" style="margin:0 0 14px;color:${BRAND.onSurfaceVariant};
    font-size:15px;line-height:1.7;font-family:${BRAND.fontFamily};">${text}</p>`
}

export function warningText(text: string): string {
  return `<p style="margin:0 0 20px;color:${BRAND.warning};font-size:15px;
    font-weight:600;line-height:1.5;font-family:${BRAND.fontFamily};">${text}</p>`
}

export function primaryButton(label: string, href: string): string {
  return `<!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}"
    style="height:50px;v-text-anchor:middle;width:260px;" arcsize="14%"
    strokecolor="${BRAND.primary}" fillcolor="${BRAND.primary}">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:${BRAND.fontFamily};font-size:16px;font-weight:700;">
      ${label}
    </center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-->
  <a href="${href}"
    style="display:inline-block;background:${BRAND.primary};color:#ffffff;
      padding:15px 40px;border-radius:8px;text-decoration:none;
      font-weight:700;font-size:16px;letter-spacing:0.01em;
      font-family:${BRAND.fontFamily};mso-hide:all;">${label}</a>
  <!--<![endif]-->`
}

export function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="height:24px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td style="height:1px;background:${BRAND.border};font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td style="height:20px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>`
}

export function smallText(text: string): string {
  return `<p class="email-small" style="margin:0;color:${BRAND.footer};
    font-size:13px;line-height:1.6;font-family:${BRAND.fontFamily};">${text}</p>`
}

/**
 * Icon in a tinted circle.
 * bgColor must be a solid hex — not rgba (Outlook ignores rgba).
 */
export function iconBadge(svgIcon: string, bgColor: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"
    style="margin:0 0 20px;">
    <tr>
      <td width="52" height="52"
        style="width:52px;height:52px;border-radius:50%;background:${bgColor};
          text-align:center;vertical-align:middle;font-size:0;line-height:0;">
        <!--[if mso]>&nbsp;<![endif]-->
        <!--[if !mso]><!-->
        ${svgIcon}
        <!--<![endif]-->
      </td>
    </tr>
  </table>`
}

export function subheading(text: string): string {
  return `<h2 class="email-heading" style="margin:0 0 8px;color:${BRAND.onSurface};font-size:18px;
    font-weight:700;letter-spacing:-0.02em;line-height:1.3;font-family:${BRAND.fontFamily};">${text}</h2>`
}

export function infoRow(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="margin-bottom:8px;">
    <tr>
      <td style="font-size:13px;color:${BRAND.footer};font-family:${BRAND.fontFamily};
        padding-bottom:4px;border-bottom:1px solid ${BRAND.border};">
        <strong style="color:${BRAND.onSurfaceVariant};">${label}</strong>&nbsp;&nbsp;${value}
      </td>
    </tr>
  </table>`
}
