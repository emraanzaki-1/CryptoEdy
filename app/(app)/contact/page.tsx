import { GuestShell } from '@/components/layouts/guest-shell'
import { LAYOUT } from '@/lib/config/layout'
import { getNavCategories } from '@/lib/categories/getCategories'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata = {
  title: 'Contact | CryptoEdy',
  description:
    'Get in touch with the CryptoEdy team for research inquiries, editorial feedback, or partnership opportunities.',
}

export default async function ContactPage() {
  const navCategories = await getNavCategories()

  return (
    <GuestShell className={LAYOUT.guest.pagePy} navCategories={navCategories}>
      <ContactForm />
    </GuestShell>
  )
}
