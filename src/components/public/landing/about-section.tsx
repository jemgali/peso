import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/ui/carousel'
import Image from 'next/image'

const AboutSection = () => {
  return (
    <section id="about" className="scroll-mt-20 bg-gray-50 container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4 text-center">About PESO Baguio</h2>
        <div className="flex gap-4 justify-around">
            <p className="max-w-md text-lg text-gray-700 mb-4 text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a mauris odio. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In sit amet tellus et leo elementum ullamcorper et non arcu. Ut nibh metus, faucibus eget dui et, fringilla mattis orci. <br /><br />Maecenas ac viverra sem. Vestibulum pretium fringilla nisl, et lacinia risus ultricies ut. Etiam quis est augue.
            </p>
            <div className="w-full max-w-sm">
                <Carousel 
                    orientation="vertical"
                    opts={{
                        loop: true,
                        align: "center",
                    }}
                    className="w-full"    
                >
                    <CarouselContent className="h-90">
                        <CarouselItem className="basis-[60%] pt-4">
                            <div className="aspect-square w-full max-w-2xs bg-gray-400 rounded-2xl flex items-center justify-center">
                                <Image src="/assets/peso_logo.png" alt="PESO Logo" width={200} height={200} className="w-full h-auto object-contain"/>
                            </div>
                        </CarouselItem>
                        <CarouselItem className="basis-[60%] pt-4">
                            <div className="aspect-square w-full max-w-2xs bg-gray-400 rounded-2xl flex items-center justify-center">
                                <Image src="/assets/spes_logo.png" alt="PESO Logo" width={200} height={200} className="w-full h-auto object-contain"/>
                            </div>
                        </CarouselItem>
                        <CarouselItem className="basis-[60%] pt-4">
                            <div className="aspect-square w-full max-w-2xs bg-gray-400 rounded-2xl flex items-center justify-center">
                                <Image src="/assets/dole_logo.png" alt="PESO Logo" width={200} height={200} className="w-full h-auto object-contain"/>
                            </div>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    </section>
  )
}

export default AboutSection