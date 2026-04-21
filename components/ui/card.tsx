import * as React from 'react'

import { cn } from '@/lib/utils'

const cardVariants = {
  default:
    'bg-card ring-foreground/10 gap-4 rounded-xl py-4 ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
  surface: 'bg-surface-container-low border-outline-variant/15 border',
  'surface-lowest': 'bg-surface-container-lowest border-outline-variant/15 border',
  elevated: 'bg-surface-container-lowest shadow-elevated',
} as const

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  ambient: 'shadow-ambient',
  card: 'shadow-card',
  elevated: 'shadow-elevated',
} as const

const radiusMap = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
} as const

function Card({
  className,
  size = 'default',
  variant = 'default',
  shadow,
  radius,
  as: Tag = 'div',
  ...props
}: Omit<React.ComponentProps<'div'>, 'ref'> & {
  ref?: React.Ref<HTMLDivElement>
  size?: 'default' | 'sm'
  variant?: keyof typeof cardVariants
  shadow?: keyof typeof shadowMap
  radius?: keyof typeof radiusMap
  as?: 'div' | 'article' | 'section'
}) {
  const defaultRadius = variant === 'default' || variant === 'elevated' ? 'xl' : '2xl'
  const resolvedRadius = radius ?? defaultRadius
  return (
    <Tag
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card text-card-foreground flex flex-col overflow-hidden text-sm',
        cardVariants[variant],
        radiusMap[resolvedRadius],
        shadow && shadowMap[shadow],
        className
      )}
      {...(props as React.ComponentProps<'div'>)}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 group-data-[size=sm]/card:px-3', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'bg-muted/50 flex items-center rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3',
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
