import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'
import UserManagementClient from './UserManagementClient'

export default function UserManagement(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const { locale, permissions, req, visibleEntities } = initPageResult

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <SetStepNav nav={[{ label: 'App Users' }]} />
      <UserManagementClient />
    </DefaultTemplate>
  )
}
