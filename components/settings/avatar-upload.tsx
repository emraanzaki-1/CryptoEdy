'use client'

import Image from 'next/image'
import { Camera } from 'lucide-react'

interface AvatarUploadProps {
  imageUrl: string
  alt?: string
}

export function AvatarUpload({ imageUrl, alt = 'Profile picture' }: AvatarUploadProps) {
  return (
    <section>
      <h3 className="text-on-surface mb-5 text-base font-semibold">Profile Image</h3>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="group bg-surface-container ring-surface-container-low relative size-24 overflow-hidden rounded-full ring-4">
          <Image alt={alt} className="size-full object-cover" src={imageUrl} fill sizes="96px" />
          <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-6 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <button className="bg-surface-container-high text-on-surface hover:bg-outline-variant/20 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
              Upload new
            </button>
            <button className="text-error hover:bg-error-container/50 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
              Remove
            </button>
          </div>
          <p className="text-outline text-sm">Supports WEBP, SVG, PNG, JPG (Max 5MB)</p>
        </div>
      </div>
    </section>
  )
}
