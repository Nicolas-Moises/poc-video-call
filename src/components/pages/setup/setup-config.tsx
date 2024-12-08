/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import ActiveSpeaker from "@/components/common/active-speaker"
import { LocalVideo } from "@/components/common/local-video"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useMediaDevices } from "@/contexts/media-devices-context"
import { Camera, CameraOff, Mic, MicOff, User } from "lucide-react"
import Link from "next/link"

export function SetupConfig() {
  const { 
    userMediaStream, 
    devices, 
    isFetchingDevices, 
    setSelectedDevices, 
    selectedDevices, 
    handleChangeDevices, 
    toggleMicrophone, 
    audioEnabled,
    toggleVideo,
    videoEnabled
  } = useMediaDevices()

  const handleSelectDevice = (deviceId: string, deviceKind: "audioinput" | "videoinput") => {
    setSelectedDevices((prev) => ({...prev, [deviceKind]: deviceId }))
  }

  return (
    <div className="flex flex-col gap-6">
      
      <h2 className="font-semibold tracking-tighter text-2xl">Setup config</h2>
      <div className="space-y-4 max-w-xl">
        <h3 className="font-semibold tracking-tighter">Selecione o microfone</h3>
        {isFetchingDevices || !userMediaStream ? (
          <div className="flex items-center gap-2">
            <Skeleton className="w-full h-9" />
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <Select defaultValue={selectedDevices.audioDeviceId} onValueChange={(deviceId) => {
                handleChangeDevices(deviceId, "audioinput")
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um dispositivo de microfone" />
                </SelectTrigger>
                <SelectContent>
                  {devices.audio.map((device) => {
                    return (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <Button onClick={toggleMicrophone} size={'icon'} variant='outline'>
                {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>
            </div>
            <ActiveSpeaker isEnabled={audioEnabled} stream={userMediaStream} />
          </>
        )}
      </div>

      <div className="space-y-4 max-w-xl">
        <h3 className="font-semibold tracking-tighter">Selecione a câmera</h3>
        {isFetchingDevices || !userMediaStream  ? (
          <div className="flex items-center gap-2">
            <Skeleton className="w-full h-9" />
          </div>
        ) : (
          <div className="flex gap-4">
            <Select defaultValue={selectedDevices.videoDeviceId} onValueChange={(deviceId) => {
              handleSelectDevice(deviceId, "videoinput")
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um dispositivo de câmera" />
              </SelectTrigger>
              <SelectContent>
                {devices.video.map((device) => {
                  return (
                    <SelectItem key={device.deviceId} value={device.deviceId} >
                      {device.label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            <Button onClick={toggleVideo} size={'icon'} variant='outline'>
              {videoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
            </Button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl aspect-video w-full max-w-xl">
          {userMediaStream && videoEnabled && (
            <LocalVideo className="object-cover" localStream={userMediaStream} />
          )}

          {!videoEnabled && userMediaStream && (
            <div className="h-full w-full bg-zinc-500 text-zinc-700 flex items-center justify-center">
              <User size={40} />
            </div>
          )}

          {!userMediaStream && (
            <Skeleton className="w-full h-full">
              <div className="flex h-full items-center justify-center text-gray-500">
                Loading video...
              </div>
            </Skeleton>
          )}
        </div>
      </div>


      <Button className="max-w-xl" asChild>
        <Link href={'/peer'}>
          Prosseguir
        </Link>
      </Button>
    </div>
  )
}