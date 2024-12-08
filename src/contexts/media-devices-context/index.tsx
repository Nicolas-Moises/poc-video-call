'use client'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";

interface MediaDeviceContextProps {
  userMediaStream: MediaStream | null
  devices: DeviceCollection
  isFetchingDevices: boolean
  setSelectedDevices: Dispatch<SetStateAction<{
    audioDeviceId: string;
    videoDeviceId: string;
  }>>
  selectedDevices: {
    audioDeviceId: string;
    videoDeviceId: string;
  }
  toggleVideo: () => void;
  toggleMicrophone: () => void;
  handleChangeDevices: (deviceId: string, deviceKind: "audioinput" | "videoinput") => void

  audioEnabled: boolean
  videoEnabled: boolean
}

const MediaDeviceContext = createContext<MediaDeviceContextProps>({} as MediaDeviceContextProps)

interface DeviceCollection {
  audio: MediaDeviceInfo[];
  video: MediaDeviceInfo[];
}

const DEFAULT_DEVICES: DeviceCollection = {
  audio: [],
  video: [],
};

export function MediaDeviceProvider({ children }: { children: ReactNode}) {
  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(null)
  const [devices, setDevices] = useState<DeviceCollection>(DEFAULT_DEVICES);
  const [isFetchingDevices, setIsFetchingDevices] = useState(true)
  const [selectedDevices, setSelectedDevices] = useState({
    audioDeviceId: '',
    videoDeviceId: '',
  })

  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  
  // first: catch media streams
  const constraints: MediaStreamConstraints = {
    audio: {
      deviceId: {
        ideal: selectedDevices.audioDeviceId ? selectedDevices.audioDeviceId : undefined,
      }
    },
    video: {
      deviceId: {
        ideal: selectedDevices.videoDeviceId? selectedDevices.videoDeviceId : undefined,
      }
    },
  }

  const getMicAndCamera = async () => {
    try {
      stopActiveTracks()
      setIsFetchingDevices(true)
      await navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        setUserMediaStream(stream)
      })
    } catch (error) {
      if(error instanceof DOMException) {
        console.log(error)
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
    } finally {
      setIsFetchingDevices(false)
    }
  }

  const stopActiveTracks = () => {
    if (userMediaStream) {
      userMediaStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMicrophone = () => {
    if (userMediaStream) {
      const audioTracks = userMediaStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled =!track.enabled;
        setAudioEnabled(track.enabled);
      });
    }
  }

  const toggleVideo = () => {
    if (userMediaStream) {
      const videoTracks = userMediaStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled =!track.enabled;
        setVideoEnabled(track.enabled);
      });
    }
  }

  const fetchDevices = async () => {
    try {
      setIsFetchingDevices(true)

      // Enumerate devices
      const deviceList = await navigator.mediaDevices.enumerateDevices();

      // Categorize devices
      const categorizedDevices = deviceList.reduce<DeviceCollection>((acc, device) => {
        // Create a Set to track unique device IDs
        const uniqueVideoDevices = new Set(acc.video.map(device => device.deviceId));
        const uniqueAudioDevices = new Set(acc.audio.map(device => device.deviceId));
      
        switch (device.kind) {
          case "videoinput":
            if (!uniqueVideoDevices.has(device.deviceId)) {
              acc.video.push(device as MediaDeviceInfo);
            }
            break;
          case "audioinput":
            if (!uniqueAudioDevices.has(device.deviceId)) {
              acc.audio.push(device as MediaDeviceInfo);
            }
            break;
        }
        return acc;
      }, { ...DEFAULT_DEVICES });

      // Update state
      setDevices(categorizedDevices);
      setSelectedDevices({
        audioDeviceId: categorizedDevices.audio[0]?.deviceId?? '',
        videoDeviceId: categorizedDevices.video[0]?.deviceId?? '',
      })

    } catch (err) {
      console.error("Error fetching devices:", err);
    } finally {
      setIsFetchingDevices(false)
    }
  }

  const handleChangeDevices = (deviceId: string, deviceKind: "audioinput" | "videoinput") => {
    const newConstraints = {
      ...constraints,
      [deviceKind]: {
        exact: deviceId,
      }
    }

    navigator.mediaDevices.getUserMedia(newConstraints).then((stream) => {
      setUserMediaStream(stream)

      const tracks = stream.getAudioTracks();
        console.log(tracks);
    })

    setSelectedDevices((prev) => ({...prev, [deviceKind]: deviceId }))
  }

  useEffect(() => {
    // check if the browser supports media devices and getUserMedia API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Media devices are not supported in this browser.');
      return;
    }
    getMicAndCamera().then(() => fetchDevices())
    return () => {
      if(userMediaStream) {
        userMediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <MediaDeviceContext.Provider value={{ 
      userMediaStream, 
      devices, 
      isFetchingDevices, 
      setSelectedDevices, 
      selectedDevices,
      handleChangeDevices,
      toggleMicrophone,
      toggleVideo,
      videoEnabled,
      audioEnabled
    }}>
      {children}
    </MediaDeviceContext.Provider>
  )
}

export function useMediaDevices() {
  return useContext(MediaDeviceContext)
}