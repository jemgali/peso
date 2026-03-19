import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="w-full flex items-center justify-center p-4 flex-col gap-4">
        <div className="flex gap-4">
            <Image src="/assets/dole_logo_with_name.png" alt="PESO Logo" width={50} height={50} />
            <Image src="/assets/baguio_seal.png" alt="PESO Logo" width={50} height={50} />
            <Image src="/assets/peso_logo.png" alt="PESO Logo" width={50} height={50} />
        </div>
        <p className="text-sm text-gray-500">© 2026 Public Employment Service Office - City Government of Baguio | All Rights Reserved</p>
    </footer>
  )
}

export default Footer