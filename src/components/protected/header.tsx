import React from 'react'
import Image from 'next/image'
import UserProfile from './user-profile'
import { NotificationBell } from '@/components/notifications'

const Header = () => {
  return (
    <header className="w-full bg-gov-header text-gov-header-foreground shadow-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Image 
            src="/assets/peso_logo.png" 
            alt="PESO Logo" 
            width={56} 
            height={56}
            className="shrink-0"
            priority
          />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-tight md:text-2xl">
              Public Employment Service Office
            </h1>
            <p className="text-sm opacity-90">City Government of Baguio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <UserProfile />
        </div>
      </div>
    </header>
  )
}

export default Header