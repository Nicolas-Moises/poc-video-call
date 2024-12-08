import { useState, useEffect, useRef, useCallback } from 'react';

export default function useAudioVolume({
  source,
  fftSize = 2048,
  sensitivity = 0.5
}: UseAudioVolume) {
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const processAudio = useCallback(() => {
    if (!source) return;

    // Create audio context and analyser if not existing
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const audioContext = audioContextRef.current;

    // Create or reset analyser
    if (!analyserRef.current) {
      analyserRef.current = new AnalyserNode(audioContext, { 
        fftSize,
        minDecibels: -90,
        maxDecibels: -10,
        smoothingTimeConstant: 0.85
      });
    }
    const analyser = analyserRef.current;

    // Connect audio source
    const audioSource = audioContext.createMediaStreamSource(source);
    audioSource.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      animationFrameRef.current = requestAnimationFrame(() => {
        // Get time domain data
        analyser.getByteTimeDomainData(dataArray);

        // Calculate volume with improved normalization
        const volumes = dataArray.map(value => Math.abs(value - 128));
        const averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

        // Normalize and apply sensitivity
        const normalizedVolume = Math.min(
          Math.max(
            (averageVolume / 128) * sensitivity, // Scale by sensitivity
            0
          ),
          1
        );

        // Optional: Apply some additional smoothing
        setVolume(prev => prev + (normalizedVolume - prev) * 0.3);

        // Continue update loop
        updateVolume();
      });
    };

    // Start update loop
    updateVolume();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioSource) {
        audioSource.disconnect();
      }
      if (analyserRef.current) {
        analyser.disconnect();
      }
    };
  }, [source, fftSize, sensitivity]);

  useEffect(() => {
    if (!source) return;

    const cleanup = processAudio();

    return () => {
      cleanup?.();
      setVolume(0);
    };
  }, [source, processAudio]);

  return {
    volume,
  };
}

type UseAudioVolume = {
  source: MediaStream | null;
  fftSize?: FftSize;
  sensitivity?: number;
};

type FftSize =
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048
  | 4096
  | 8192
  | 16384
  | 32768;