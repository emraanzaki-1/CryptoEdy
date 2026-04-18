import { Construction } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <div className="bg-surface-container mb-6 flex size-16 items-center justify-center rounded-2xl">
        <Construction className="text-on-surface-variant size-8" />
      </div>
      <h1 className="text-on-surface mb-2 text-2xl font-bold tracking-[-0.04em]">{title}</h1>
      <p className="text-on-surface-variant max-w-sm text-sm">
        {description ?? 'This feature is under development and will be available soon.'}
      </p>
    </div>
  )
}
