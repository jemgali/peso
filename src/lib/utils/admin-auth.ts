import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function requireAdmin() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList
  })

  if (!session || !session.user) {
    redirect('/auth/sign-in')
  }

  const role = session.user.role || 'client'

  if (role !== 'admin') {
    redirect('/')
  }

  return session.user
}
