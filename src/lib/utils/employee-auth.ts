import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function requireEmployee() {
  const headersList = await headers()

  const session = await auth.api.getSession({
    headers: headersList
  })

  if (!session || !session.user) {
    redirect('/auth/sign-in')
  }

  if (!session.user.emailVerified) {
    redirect('/auth/verify-email')
  }

  const role = session.user.role || 'client'

  if (role !== 'admin' && role !== 'employee') {
    redirect('/')
  }

  return session.user
}
