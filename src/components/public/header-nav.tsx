"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import { useActivePath } from '@/hooks/use-active-path'
import { authClient } from '@/lib/auth-client'
import UserProfile from '@/components/protected/user-profile'

const NAV_LINKS = [
  { label: 'Home', href: '/#home', id: 'home' },
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'Programs', href: '/#programs', id: 'programs' },
  { label: 'Contact', href: '/#contact', id: 'contact' },
]

const HeaderNav = () => {
  const checkActive = useActivePath()
  const [activeTab, setActiveTab] = useState('home')
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    const updateActiveTab = () => {
      const currentHash = window.location.hash.replace('#', '') || 'home'      
      if (checkActive('/')) {
        const isValidHash = NAV_LINKS.some(link => link.id === currentHash)
        setActiveTab(isValidHash ? currentHash : 'home')
      } 
      else if (checkActive('/auth/login') || checkActive('/auth/sign-up')) {
        setActiveTab('login')
      } 
      else {
        setActiveTab('')
      }
    }
    updateActiveTab()
    window.addEventListener('hashchange', updateActiveTab)
    return () => window.removeEventListener('hashchange', updateActiveTab)
  }, [checkActive])

  return (
    <nav className="ml-auto flex items-center gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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