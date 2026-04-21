import { cn } from '@/lib/utils'

type SurfaceCardProps = {
  variant?: 'lowest' | 'low'
  radius?: 'xl' | '2xl'
  border?: boolean
  shadow?: 'none' | 'sm' | 'ambient' | 'card' | 'elevated'
  hover?: boolean
  as?: 'div' | 'article'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>

const surfaceMap = {
  lowest: 'bg-surface-container-lowest',
  low: 'bg-surface-container-low',
} as const

const radiusMap = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
} as const

const shadowMap = {
  none: '',
  sm: 'shadow-sm',
  ambient: 'shadow-ambient',
  card: 'shadow-card',
  elevated: 'shadow-elevated',
} as const

function SurfaceCard({
  variant = 'lowest',
  radius = '2xl',
  border = false,
  shadow = 'none',
  hover = false,
  as: Tag = 'div',
  className,
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <Tag
      className={cn(
        surfaceMap[variant],
        radiusMap[radius],
        shadowMap[shadow],
        border && 'border-outline-variant/15 border',
        hover && 'transition-all hover:-translate-y-0.5',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export { SurfaceCard }
