import * as React from 'react'
import { cn } from '@/lib/utils'

/* ── Shared polymorphic helper ───────────────────────────────── */

type PolymorphicProps<T extends React.ElementType, Extra = object> = {
  as?: T
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'> &
  Extra

/* ── Display — hero / splash headings ────────────────────────── */

function Display<T extends React.ElementType = 'h1'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Tag = as ?? 'h1'
  return <Tag className={cn('text-on-surface text-display font-black', className)} {...props} />
}

/* ── Heading — page / section headings ───────────────────────── */

const headingSizeMap = {
  lg: 'text-headline-lg',
  md: 'text-headline-md',
  default: 'text-headline',
} as const

function Heading<T extends React.ElementType = 'h2'>({
  as,
  size = 'default',
  className,
  ...props
}: PolymorphicProps<T, { size?: keyof typeof headingSizeMap }>) {
  const Tag = as ?? 'h2'
  return (
    <Tag className={cn('text-on-surface font-bold', headingSizeMap[size], className)} {...props} />
  )
}

/* ── Title — sub-section / card headings ─────────────────────── */

function Title<T extends React.ElementType = 'h3'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Tag = as ?? 'h3'
  return <Tag className={cn('text-on-surface text-title font-bold', className)} {...props} />
}

/* ── Body — paragraph text ───────────────────────────────────── */

const bodySizeMap = {
  lg: 'text-body-lg',
  default: 'text-body',
  sm: 'text-body-sm',
} as const

function Body<T extends React.ElementType = 'p'>({
  as,
  size = 'default',
  className,
  ...props
}: PolymorphicProps<T, { size?: keyof typeof bodySizeMap }>) {
  const Tag = as ?? 'p'
  return <Tag className={cn('text-on-surface', bodySizeMap[size], className)} {...props} />
}

/* ── Caption — secondary descriptions, helper text ───────────── */

function Caption<T extends React.ElementType = 'p'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Tag = as ?? 'p'
  return <Tag className={cn('text-on-surface-variant text-body-sm', className)} {...props} />
}

/* ── Overline — badges, micro-labels, uppercase markers ──────── */

function Overline<T extends React.ElementType = 'span'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Tag = as ?? 'span'
  return <Tag className={cn('text-overline font-bold uppercase', className)} {...props} />
}

export { Display, Heading, Title, Body, Caption, Overline }
