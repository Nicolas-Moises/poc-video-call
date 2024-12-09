'use client'
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

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
  getMediaError: null | string;
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

interface MediaStreamControls {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
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
  const [getMediaError, setGetMediaError] = useState<string | null>(null)

  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  
  // first: catch media streams
  // const constraints: MediaStreamConstraints = {
  //   audio: {
  //     deviceId: {
  //       ideal: selectedDevices.audioDeviceId ? selectedDevices.audioDeviceId : undefined,
  //     }
  //   },
  //   video: {
  //     deviceId: {
  //       ideal: selectedDevices.videoDeviceId? selectedDevices.videoDeviceId : undefined,
  //     }
  //   },
  // }

  const getMicAndCamera = useCallback(async (constraints: MediaStreamControls) => {
    try {
      await navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        setUserMediaStream(stream)
        return stream;
      })
    } catch (error) {
      if(error instanceof DOMException) {
        console.error(error)
        switch(error.name) {
          case 'NotAllowedError':
            toast.error('O usuário negou a solicitação de câmera e microfone.');
            setGetMediaError('O usuário negou a solicitação de câmera e microfone.')
            break;
          case 'NotFoundError':
            toast.error('Nenhuma câmera ou microfone encontrado.');
            setGetMediaError('Nenhuma câmera ou microfone encontrado.')
            break;
          case 'NotSupportedError':
            toast.error('O navegador atual não oferece suporte à API getUserMedia.');
            setGetMediaError('O navegador atual não oferece suporte à API getUserMedia.');
            break;
          case 'NetworkError':
            toast.error('Erro de rede.');
            setGetMediaError('Erro de rede.');
            break;
          default:
            toast.error('Ocorreu um erro desconhecido.');
            setGetMediaError('Ocorreu um erro desconhecido.');
        }
      }
    }
  }, [])

  const startStream = async () => {
    await getMicAndCamera({
      audio: true,
      video: true
    });
  };

  const stopActiveTracks = () => {
    if (userMediaStream) {
      userMediaStream.getTracks().forEach(track => track.stop());
      setUserMediaStream(null);
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
        if(track.enabled) {
          track.enabled = false;
        }
        else {
          track.enabled = true;
        }
        setVideoEnabled(track.enabled);
      });
    }
  }

  const getDevices = useCallback(async () => {
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
  }, [])

  const handleChangeDevices = useCallback(async (deviceId: string, deviceKind: "audioinput" | "videoinput") => {
    if (!userMediaStream) {
      throw new Error('No active media stream');
    }

    const tracks = deviceKind === 'audioinput' 
    ? userMediaStream.getAudioTracks() 
    : userMediaStream.getVideoTracks();

    tracks.forEach(track => track.stop());

    const newStream = await getMicAndCamera({
      audio: deviceKind === 'audioinput' ? { deviceId: { exact: deviceId } } : true,
      video: deviceKind === 'videoinput' ? { deviceId: { exact: deviceId } } : true
    });
    if(deviceKind === 'audioinput') {
      setSelectedDevices({
        ...selectedDevices,
        audioDeviceId: deviceId,
      })
    } else {
      setSelectedDevices({
       ...selectedDevices,
        videoDeviceId: deviceId,
      })
    }

    return newStream;
  }, [userMediaStream, getMicAndCamera, selectedDevices]) 

  useEffect(() => {
    // check if the browser supports media devices and getUserMedia API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Media devices are not supported in this browser.');
      setGetMediaError('')
      return;
    }

    startStream().then(() => getDevices())
    
    navigator.mediaDevices.addEventListener('devicechange', getDevices);

    // Cleanup
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
      stopActiveTracks();
    };
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
      audioEnabled,
      getMediaError,
    }}>
      {children}
    </MediaDeviceContext.Provider>
  )
}

export function useMediaDevices() {
  return useContext(MediaDeviceContext)
}