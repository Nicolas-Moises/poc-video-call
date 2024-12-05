'use client'

import { useMediaDevices } from "@/contexts/media-devices-context"

export function SetupConfig() {

  const { userMediaStream, localVideoRef } = useMediaDevices()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="font-semibold tracking-tighter text-2xl">Setup config</h2>
      
      <div className="overflow-hidden rounded-xl">
        {userMediaStream && (
          <video ref={localVideoRef} className="w-full h-full object-contain" autoPlay muted />
        )}

        {!userMediaStream && (
          <div>...Loading video</div>
        )}
      </div>
    </div>
  )
}