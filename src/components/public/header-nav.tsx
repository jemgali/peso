"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import UserProfile from '@/components/protected/user-profile'

const NAV_LINKS = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'How to Apply', href: '/home/how-to-apply', id: 'how-to-apply' },
]

const HeaderNav = () => {
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()

  const activeTab =
    pathname === '/'
      ? 'home'
      : pathname.startsWith('/home/how-to-apply')
      ? 'how-to-apply'
      : !session?.user && pathname.startsWith('/auth/sign-in')
      ? 'sign-in'
      : ''

  return (
    <nav className="ml-auto flex items-center gap-4">
      <Tabs value={activeTab}>
        <TabsList variant="line" className="gap-1">
          {NAV_LINKS.map((link) => (
            <TabsTrigger 
              key={link.id} 
              value={link.id} 
              asChild
              className="text-gov-header-foreground/80 hover:text-gov-header-foreground data-active:text-gov-header-foreground"
            >
              <Link href={link.href}>
                {link.label}
              </Link>
            </TabsTrigger>
          ))}
          {!isPending && !session?.user && (
            <TabsTrigger 
              value="sign-in" 
              asChild
              className="text-gov-header-foreground/80 hover:text-gov-header-foreground data-active:text-gov-header-foreground"
            >
              <Link href="/auth/sign-in">
                Login
              </Link>
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>
      {isPending ? (
        <Spinner className="size-4 text-gov-header-foreground/70" />
      ) : session?.user ? (
        <UserProfile />
      ) : null}
    </nav>
  )
}

export default HeaderNav
