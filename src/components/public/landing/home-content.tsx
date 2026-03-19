import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/ui/button'

const HomeContent = () => {
  return (
    <section id="home" className="scroll-mt-24 container mx-auto px-4 py-8">
        <div className="flex gap-4 justify-around">
            <div className="aspect-square w-full max-w-2xs bg-gray-400 rounded-2xl flex items-center justify-center">
                <Image src="/assets/peso_logo.png" alt="PESO Logo" width={200} height={200} className="w-full h-auto object-contain"/>
            </div>
            <div className="max-w-md flex flex-col gap-4">
                <p className="text-lg text-gray-700 text-center">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a mauris odio. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In sit amet tellus et leo elementum ullamcorper et non arcu. Ut nibh metus, faucibus eget dui et, fringilla mattis orci. Maecenas ac viverra sem. Vestibulum pretium fringilla nisl, et lacinia risus ultricies ut. Etiam quis est augue.
                </p>
                <Button type="button" className="self-center rounded-lg bg-primary text-white hover:bg-primary/90">
                    <Link href="/auth/sign-up" >
                        Apply Now
                    </Link>
                </Button>
            </div>
        </div>
    </section>
  )
}

export default HomeContent