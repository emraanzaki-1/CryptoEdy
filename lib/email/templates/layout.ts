// Brand tokens — single source of truth for all email templates
export const BRAND = {
  primary: '#0052FF',
  primaryDark: '#003EC7',
  surface: '#F8F9FA',
  onSurface: '#0B1C30',
  onSurfaceVariant: '#434656',
  footer: '#6B7280',
  borderRadius: '8px',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const

interface EmailLayoutOptions {
  previewText?: string
  children: string
}

export function emailLayout({ previewText = '', children }: EmailLayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>CryptoEdy</title>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:${BRAND.fontFamily};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background-color:${BRAND.surface};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:480px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:${BRAND.primary};
                letter-spacing:-0.04em;text-decoration:none;">
                CryptoEdy
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 36px;
              box-shadow:0 4px 24px -4px rgba(11,28,48,0.08);">
              ${children}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0;color:${BRAND.footer};font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} CryptoEdy. All rights reserved.<br />
                You're receiving this because you created a CryptoEdy account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function primaryButton(label: string, href: string): string {
  return `<a href="${href}"
    style="display:inline-block;background:${BRAND.primary};color:#ffffff;
      padding:14px 28px;border-radius:${BRAND.borderRadius};text-decoration:none;
      font-weight:700;font-size:15px;letter-spacing:0.01em;margin:24px 0;">
    ${label}
  </a>`
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:${BRAND.onSurfaceVariant};font-size:15px;line-height:1.7;">${text}</p>`
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;color:${BRAND.onSurface};font-size:24px;
    font-weight:800;letter-spacing:-0.03em;line-height:1.2;">${text}</h1>`
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #E5EEFF;margin:24px 0;" />`
}

export function smallText(text: string): string {
  return `<p style="margin:16px 0 0;color:${BRAND.footer};font-size:12px;line-height:1.6;">${text}</p>`
}
