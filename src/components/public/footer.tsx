import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const Footer = () => {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-8">
        <div className="flex items-center gap-6">
          <Image 
            src="/assets/dole_logo_with_name.png" 
            alt="DOLE Logo" 
            width={48} 
            height={48}
            className="object-contain"
          />
          <Image 
            src="/assets/baguio_seal.png" 
            alt="Baguio City Seal" 
            width={48} 
            height={48}
            className="object-contain"
          />
          <Image 
            src="/assets/peso_logo.png" 
            alt="PESO Logo" 
            width={48} 
            height={48}
            className="object-contain"
          />
        </div>
        
        <Separator className="max-w-md" />
        
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/#home" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/#programs" className="text-muted-foreground hover:text-foreground transition-colors">
            Programs
          </Link>
          <Link href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
        
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Public Employment Service Office - City Government of Baguio | All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

export default Footer