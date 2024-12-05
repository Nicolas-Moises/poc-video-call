'use client'
import { createContext, ReactNode, RefObject, useContext, useEffect, useRef, useState } from "react";

interface MediaDeviceContextProps {
  userMediaStream: MediaStream | null
  localVideoRef: RefObject<HTMLVideoElement>
}

const MediaDeviceContext = createContext<MediaDeviceContextProps>({} as MediaDeviceContextProps)

export function MediaDeviceProvider({ children }: { children: ReactNode}) {
  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(null)


  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  
  // first: catch media streams
  const constraints = {
    audio: true,
    video: true,
  }

  const getMicAndCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setUserMediaStream(stream)
    } catch (error) {
      if(error instanceof DOMException) {
        switch(error.name) {
          case 'NotAllowedError':
            alert('User denied the request for camera and microphone.');
            break;
          case 'NotFoundError':
            alert('No camera or microphone found.');
            break;
          case 'NotSupportedError':
            alert('The current browser does not support getUserMedia API.');
            break;
          case 'NetworkError':
            alert('Network error.');
            break;
          default:
            alert('An unknown error occurred.');
        }
      }
      console.error(error)
    }
  }

  useEffect(() => {
  
    // check if the browser supports media devices and getUserMedia API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Media devices are not supported in this browser.');
      return;
    }

    getMicAndCamera().then(() => console.info('Media stream ready!'))

    return () => {
      if(userMediaStream) {
        userMediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if(userMediaStream && localVideoRef.current) {
      localVideoRef.current.srcObject = userMediaStream
    }
    console.log('re')
  }, [userMediaStream])

  return (
    <MediaDeviceContext.Provider value={{ userMediaStream, localVideoRef }}>
      {children}
    </MediaDeviceContext.Provider>
  )
}

export function useMediaDevices() {
  return useContext(MediaDeviceContext)
}