import React from 'react'
import Image from "next/image"
import { Spinner } from '@/ui/spinner'
import { Skeleton } from '@/ui/skeleton'

const Loading = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm fixed inset-0 z-100">
      <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500 w-full max-w-sm px-4">
        
        {/* Logo Container with subtle pulse */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-white shadow-lg border border-primary/10 shrink-0">
            <Image 
              src="/assets/peso_logo.png" 
              alt="PESO Logo" 
              fill 
              className="object-cover p-1" 
              sizes="96px"
              priority
            />
          </div>
        </div>

        {/* Loading Text and Components */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex items-center gap-3 text-primary">
            <Spinner className="h-6 w-6" />
            <h2 className="text-2xl font-bold tracking-tight">
              Loading
            </h2>
          </div>
          
          <p className="text-muted-foreground text-sm font-medium text-center pb-4">
            Preparing the Public Employment Service Office system...
          </p>

          {/* Skeleton Standby UI */}
          <div className="w-full space-y-3 opacity-60">
            <Skeleton className="h-3 w-[85%] mx-auto" />
            <Skeleton className="h-3 w-[65%] mx-auto" />
            <Skeleton className="h-3 w-[75%] mx-auto" />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Loading