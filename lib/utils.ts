import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'overline',
            'label',
            'body-sm',
            'body',
            'body-lg',
            'subtitle',
            'title',
            'headline',
            'headline-md',
            'headline-lg',
            'display',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
