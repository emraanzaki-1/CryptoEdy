import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap'
import configPromise from '@payload-config'
import { serverFunction } from './actions'
import '@payloadcms/ui/scss/app.scss'
import '@payloadcms/next/css'
// Payload Makeup — icons, transitions, toast recoloring, popover animations
import '@/styles/admin-makeup.css'
// CryptoEdy brand skin — must load after Payload's CSS so @layer payload wins
import '@/styles/admin.css'

type Args = {
  children: React.ReactNode
}

export default async function PayloadLayout({ children }: Args) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
