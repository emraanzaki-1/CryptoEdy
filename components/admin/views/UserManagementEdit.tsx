import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'
import UserManagementEditClient from './UserManagementEditClient'

export default function UserManagementEdit(props: AdminViewServerProps) {
  const { initPageResult, params, searchParams } = props
  const { locale, permissions, req, visibleEntities } = initPageResult

  // Payload admin uses [[...segments]] catch-all route.
  // For /admin/user-management/:id, segments = ['user-management', '<id>']
  const segments = (params as { segments?: string[] })?.segments ?? []
  const userId = segments[1] ?? ''

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
      <SetStepNav
        nav={[{ label: 'App Users', url: '/admin/user-management' }, { label: 'Edit User' }]}
      />
      <UserManagementEditClient userId={userId} />
    </DefaultTemplate>
  )
}
