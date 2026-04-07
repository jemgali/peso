import React from 'react'

const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-center border-t bg-background px-4 py-2 text-center text-xs text-muted-foreground">
      <p>© {new Date().getFullYear()} Public Employment Service Office - City Government of Baguio | All Rights Reserved</p>
    </footer>
  )
}

export default Footer