import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Facebook, Mail, MapPin, Phone } from 'lucide-react'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Location',
    content: '2nd Floor, Left Wing, Baguio City Hall, City Hall Loop, 2600 Baguio City, Philippines',
    link: null,
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'peso@bfrdd.gov.ph',
    link: 'mailto:peso@bfrdd.gov.ph',
  },
  {
    icon: Phone,
    title: 'Phone',
    content: '(074) 442-4299',
    link: 'tel:+630744424299',
  },
  {
    icon: Facebook,
    title: 'Facebook',
    content: 'PESO Baguio',
    link: 'https://www.facebook.com/PESOBaguio',
  },
]

const ContactSection = () => {
  return (
    <section id="contact" className="scroll-mt-20 bg-section-alt py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Contact Us
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Have questions? Reach out to us through any of the channels below 
            or visit our office at Baguio City Hall.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.2161189136814!2d120.59154979536166!3d16.413846711221655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3391a166070e9525%3A0xc78e3cc0941138ed!2sBaguio%20City%20Hall!5e0!3m2!1sen!2sph!4v1772603284941!5m2!1sen!2sph"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PESO Baguio Location"
                className="w-full"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactInfo.map((item) => (
              <Card key={item.title} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection