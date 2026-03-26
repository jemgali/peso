"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useActivePath } from '@/hooks/use-active-path'
import { authClient } from '@/lib/auth-client'
import UserProfile from '@/components/protected/user-profile'
import { Loader2 } from 'lucide-react'

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-auto">
      <TabsList variant="line">
        {NAV_LINKS.map((link) => (
          <Link key={link.id} href={link.href} passHref>
            <TabsTrigger value={link.id} className="text-white hover:text-white/80 transition-colors">
              {link.label}
            </TabsTrigger>
          </Link>
        ))}
        {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white/70" />
        ) : session?.user ? (
            <UserProfile />
        ) : (
            <Link href="/auth/sign-in" passHref>
                <TabsTrigger value="sign-in" className="text-white hover:text-white/80 transition-colors">
                    Login
                </TabsTrigger>
            </Link>
        )}
      </TabsList>
    </Tabs>
  )
}

export default HeaderNav