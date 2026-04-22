import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { SetStepNav } from '@payloadcms/ui'
import SubscriptionManagementClient from './SubscriptionManagementClient'

export default function SubscriptionManagement(props: AdminViewServerProps) {
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
      <SetStepNav nav={[{ label: 'Subscriptions' }]} />
      <SubscriptionManagementClient />
    </DefaultTemplate>
  )
}
