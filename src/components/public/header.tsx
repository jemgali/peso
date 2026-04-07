import React from 'react'
import Image from 'next/image'
import HeaderNav from './header-nav'

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-gov-header text-gov-header-foreground shadow-md">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
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
        <HeaderNav />
      </div>
    </header>
  )
}

export default Header