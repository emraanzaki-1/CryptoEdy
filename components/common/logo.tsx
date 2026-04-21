import { cn } from '@/lib/utils'

const sizes = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const

interface LogoProps {
  size?: keyof typeof sizes
  showText?: boolean
  className?: string
  textClassName?: string
  iconClassName?: string
}

export function Logo({
  size = 'md',
  showText = true,
  className,
  textClassName,
  iconClassName,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className={cn('text-primary', iconClassName, sizes[size])}>
        <svg
          className="h-full w-full"
          fill="none"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      </div>
      {showText && (
        <h2 className={cn('text-on-surface text-subtitle font-bold', textClassName)}>CryptoEdy</h2>
      )}
    </div>
  )
}
