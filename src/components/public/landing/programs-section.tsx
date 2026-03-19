import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const programsData = [
  { src: '/assets/dole_logo.png', alt: 'Government Internship Program', title: 'Government Internship Program', rounded: false, link: '/home/services-programs/gip' },
  { src: '/assets/spes_logo.png', alt: 'Special Programs for Employment of Students', title: 'Special Programs for Employment of Students (SPES)', rounded: false, link: '/home/services-programs/spes'  },
  { src: '/assets/dole_logo.png', alt: 'National Skills Registration Program', title: 'National Skills Registration Program (NSRP)', rounded: false, link: '/home/services-programs/nsrp'  },
  { src: '/assets/dilp_logo.png', alt: 'DOLE Integrated Livelihood Program', title: 'DOLE Integrated Livelihood Program (DILP)', rounded: false, link: '/home/services-programs/dilp'  },
  { src: '/assets/jobstart_logo.png', alt: 'Jobstart', title: 'Jobstart', rounded: true, link: '/home/services-programs/jobstart'  },
  { src: '/assets/tupad_logo.jpg', alt: 'TUPAD', title: 'TUPAD', rounded: true, link: '/home/services-programs/tupad'  },
];

const ProgramsSection = () => {
  return (
    <section id="programs" className="scroll-mt-20 container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-10 text-center">PESO Services and Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programsData.map((program, index) => (
              <Link key={index} href={program.link} className="group">
                <div key={index} className="flex flex-col items-center text-center h-full">
                  <div className="relative w-50 h-50 shrink-0 mb-4 transition-transform duration-300 ease-in-out group-hover:scale-110">                    
                    <Image 
                      src={program.src} 
                      alt={program.alt} 
                      fill 
                      sizes="200px"
                      className={`object-contain ${program.rounded ? 'rounded-xl' : ''}`} 
                      />
                  </div>
                  <h3 className="text-lg font-semibold grow transition-transform duration-300 ease-in-out group-hover:scale-105">
                    {program.title}
                  </h3>
                </div>
              </Link>
            ))}
        </div>
    </section>
  )
}

export default ProgramsSection