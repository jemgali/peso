import React from 'react'
import { 
  Facebook,
  Mail,
  Phone,
 } from 'lucide-react'

const ContactSection = () => {
  return (
    <section id="contact" className="bg-gray-50 container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-10 text-center">Contact Us</h2>
        <div className="flex items-between gap-8">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.2161189136814!2d120.59154979536166!3d16.413846711221655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3391a166070e9525%3A0xc78e3cc0941138ed!2sBaguio%20City%20Hall!5e0!3m2!1sen!2sph!4v1772603284941!5m2!1sen!2sph" width={400} height={300} style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          <div className="max-w-sm px-4">
            <p className="font-bold text-2xl">Location:</p> 
            <p>2nd Floor, Left Wing, Baguio City Hall, City Hall Loop, 2600 Baguio City, Philippines</p>
          </div>
          <div className="max-w-sm px-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail />
              <p className="">Email: placeholder@peso.gov.ph</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Phone />
              <p className="">Phone: 442-4299</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Facebook />
              <p className="">Facebook: <a href="https://www.facebook.com/PESOBaguio" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">PESO Baguio</a></p>
            </div>
          </div>
        </div>
    </section>
  )
}

export default ContactSection