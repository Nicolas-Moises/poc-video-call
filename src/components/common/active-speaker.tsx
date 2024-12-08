import React from 'react';

import useIsAudioActive from '@/hooks/use-is-audio-active';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAudioVolume from '@/hooks/use-is-audio-active-v2';
import { Progress } from '../ui/progress';


const ActiveSpeaker = ({ stream, isEnabled }: { stream: MediaStream, isEnabled: boolean }) => {

  const { isSpeaking } = useIsAudioActive({ source: stream });
  const { volume } = useAudioVolume({ source: stream, sensitivity: 0.8 })
  
  return (
    <div className="flex items-center gap-2 text-sm">
    <Progress value={volume * 1000} />
      <Mic className={cn('text-muted-foreground transition-colors duration-150 ease-linear', {
        'text-emerald-400': isSpeaking && isEnabled
      })} />
    </div>
  );
}

export default ActiveSpeaker;