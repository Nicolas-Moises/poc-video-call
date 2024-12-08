"use client"

import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useMediaDevices } from '@/contexts/media-devices-context';
import { LocalVideo } from '@/components/common/local-video';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';
 
const PeerPage = () => {
  const callingVideoRef = useRef<HTMLVideoElement>(null);

  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myUniqueId, setMyUniqueId] = useState<string>("");
  const [idToCall, setIdToCall] = useState('');
  const { userMediaStream, videoEnabled, isFetchingDevices  } = useMediaDevices()

  const generateRandomString = () => Math.random().toString(36).substring(2);

  // Here we declare a function to call the identifier and retrieve 
  // its video stream.
  const handleCall = () => {
  if(userMediaStream) {
    const call = peerInstance?.call(idToCall, userMediaStream);
    if (call) {
      call.on('stream', userVideoStream => {
        console.log(userVideoStream)
        if (callingVideoRef.current) {
            callingVideoRef.current.srcObject = userVideoStream;
          }
        });
      }
    }
  };

  useEffect(() => {
    if(myUniqueId){
        let peer: Peer;
        if (typeof window !== 'undefined') {
          peer = new Peer(myUniqueId);

          setPeerInstance(peer);
          console.log(peer)
          
          if(userMediaStream) {
            peer.on('call', call => {
              call.answer(userMediaStream);
              call.on('stream', userVideoStream => {
                if (callingVideoRef.current) {
                  callingVideoRef.current.srcObject = userVideoStream;
                }
              });
            });
          }
        }
        return () => {
            if (peer) {
              peer.destroy();
            }
          };
    }
  }, [myUniqueId]);

  useEffect(() => {
    setMyUniqueId(generateRandomString);
  }, [])

  return (
    <div className='flex flex-col justify-center items-center p-12'>
      <p>your id : {myUniqueId}</p>
      {!isFetchingDevices && (
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
      )}
      <input className='text-black' placeholder="Id to call" value={idToCall} onChange={e => setIdToCall(e.target.value)} />
      <button onClick={handleCall}>call</button>
      {callingVideoRef ? (
        <video className='w-72' playsInline ref={callingVideoRef} autoPlay/>
      ) : (
        <div>Awaiting other user</div>
      )}
    </div>
  );
};

export default PeerPage;