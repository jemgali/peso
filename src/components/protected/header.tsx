import React from 'react'
import Image from 'next/image'

const Header = () => {
  return (
    <header className="bg-chart-3 text-white p-4 flex gap-4 items-center justify-between w-full shadow-md">
      <div className="flex">
        <Image src="/assets/peso_logo.png" alt="PESO Logo" width={60} height={60} />
        <div>
            <h1 className="text-2xl font-bold">Public Employment Service Office</h1>
            <h2 className="text-sm">City Government of Baguio</h2>
        </div>
      </div>
        {/* {user && <UserProfile user={user} />} */}
    </header>
  )
}

export default Header