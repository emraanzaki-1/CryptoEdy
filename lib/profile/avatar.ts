'use server'

import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']

export async function uploadAvatar(
  formData: FormData
): Promise<{ ok: true; avatarUrl: string } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  const file = formData.get('avatar') as File | null
  if (!file) {
    return { ok: false, error: 'No file provided' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Unsupported file type. Use WEBP, SVG, PNG, or JPG.' }
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return { ok: false, error: 'File too large. Maximum 5MB.' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1]
  const filename = `${crypto.randomUUID()}.${ext}`
  const avatarDir = path.join(process.cwd(), 'public', 'media', 'avatars')
  await mkdir(avatarDir, { recursive: true })
  await writeFile(path.join(avatarDir, filename), buffer)

  const avatarUrl = `/media/avatars/${filename}`

  // Delete old avatar file if it exists
  const [current] = await getDb()
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (current?.avatarUrl?.startsWith('/media/avatars/')) {
    const oldPath = path.join(process.cwd(), 'public', current.avatarUrl)
    await unlink(oldPath).catch(() => {})
  }

  await getDb()
    .update(users)
    .set({ avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return { ok: true, avatarUrl }
}

export async function removeAvatar(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  const [current] = await getDb()
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (current?.avatarUrl?.startsWith('/media/avatars/')) {
    const oldPath = path.join(process.cwd(), 'public', current.avatarUrl)
    await unlink(oldPath).catch(() => {})
  }

  await getDb()
    .update(users)
    .set({ avatarUrl: null, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  return { ok: true }
}
