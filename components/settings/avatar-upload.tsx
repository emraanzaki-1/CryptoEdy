'use client'

import { useRef, useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Camera, Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

interface AvatarUploadProps {
  imageUrl: string | null
  fallbackInitial?: string
  alt?: string
  onUploaded?: (url: string) => void
  onRemoved?: () => void
}

async function getCroppedBlob(src: string, crop: Area): Promise<Blob> {
  const image = new window.Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
    image.src = src
  })

  const canvas = document.createElement('canvas')
  const size = Math.min(crop.width, crop.height)
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9))
}

export function AvatarUpload({
  imageUrl,
  fallbackInitial = '?',
  alt = 'Profile picture',
  onUploaded,
  onRemoved,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedArea) return

    setUploading(true)
    try {
      const blob = await getCroppedBlob(cropSrc, croppedArea)
      const { uploadAvatar } = await import('@/lib/profile/avatar')
      const formData = new FormData()
      formData.append('avatar', blob, 'avatar.jpg')
      const result = await uploadAvatar(formData)
      if (result.ok) {
        onUploaded?.(result.avatarUrl)
      }
    } finally {
      setUploading(false)
      setCropSrc(null)
    }
  }

  const handleCropCancel = () => {
    setCropSrc(null)
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const { removeAvatar } = await import('@/lib/profile/avatar')
      const result = await removeAvatar()
      if (result.ok) {
        onRemoved?.()
      }
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <section>
        <h3 className="text-on-surface mb-5 text-base font-semibold">Profile Image</h3>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div
            className="group bg-surface-container ring-surface-container-low relative size-24 cursor-pointer overflow-hidden rounded-full ring-4"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={alt} className="size-full object-cover" src={imageUrl} />
            ) : (
              <div className="bg-primary text-on-primary flex size-full items-center justify-center text-2xl font-bold">
                {fallbackInitial}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              {uploading ? (
                <Loader2 className="size-6 animate-spin text-white" />
              ) : (
                <Camera className="size-6 text-white" />
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface-container-high text-on-surface hover:bg-outline-variant/20 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload new'}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  disabled={removing}
                  onClick={handleRemove}
                  className="text-error hover:bg-error-container/50 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              )}
            </div>
            <p className="text-outline text-sm">Supports WEBP, SVG, PNG, JPG (Max 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </section>

      {/* Crop Modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border-outline-variant/15 mx-4 w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl">
            <div className="border-outline-variant/15 border-b px-6 py-4">
              <h3 className="text-on-surface text-base font-bold">Adjust Photo</h3>
              <p className="text-on-surface-variant mt-1 text-sm">
                Drag to reposition, scroll to zoom
              </p>
            </div>

            <div className="relative aspect-square bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="border-outline-variant/15 flex items-center justify-center gap-6 border-t px-6 py-4">
              <div className="flex items-center gap-3">
                <ZoomOut className="text-on-surface-variant size-4" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="accent-primary w-32"
                />
                <ZoomIn className="text-on-surface-variant size-4" />
              </div>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors"
              >
                <RotateCw className="size-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="border-outline-variant/15 flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={handleCropCancel}
                disabled={uploading}
                className="text-on-surface-variant hover:bg-surface-container rounded-full px-6 py-2.5 text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                disabled={uploading}
                className="from-primary to-primary-container text-on-primary flex items-center gap-2 rounded-full bg-gradient-to-b px-6 py-2.5 text-sm font-bold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {uploading && <Loader2 className="size-4 animate-spin" />}
                {uploading ? 'Saving…' : 'Save photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
