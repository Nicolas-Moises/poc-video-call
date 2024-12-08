'use client'

import { ComponentProps, useEffect, useRef } from "react"

interface LocalVideoProps extends ComponentProps<'video'> {
  localStream: MediaStream
}

export function LocalVideo({ localStream, className, ...props }: LocalVideoProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if(localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  },[localStream]);

  return (
    <video autoPlay playsInline ref={localVideoRef} className={className} {...props}>
      <source src="local_video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}