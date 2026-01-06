'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type MediaPermission = 'unknown' | 'granted' | 'denied';

export interface MediaState {
  videoOn: boolean;
  audioOn: boolean;
  cameraPermission: MediaPermission;
  micPermission: MediaPermission;
}

export const useMediaPreview = () => {
  const [media, setMedia] = useState<MediaState>({
    videoOn: false,
    audioOn: false,
    cameraPermission: 'unknown',
    micPermission: 'unknown',
  });

  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) return;

        streamRef.current = mediaStream;
        setStream(mediaStream);

        setMedia({
          videoOn: true,
          audioOn: true,
          cameraPermission: 'granted',
          micPermission: 'granted',
        });
      } catch {
        if (cancelled) return;

        setMedia((prev) => ({
          ...prev,
          cameraPermission: 'denied',
          micPermission: 'denied',
        }));
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleVideo = useCallback(() => {
    // TODO
  }, []);

  const toggleAudio = useCallback(() => {
    // TODO
  }, []);

  const canRenderVideo = useMemo(() => {
    return (
      media.videoOn && media.cameraPermission === 'granted' && stream !== null
    );
  }, [media.videoOn, media.cameraPermission, stream]);

  return {
    media,
    stream,
    canRenderVideo,
    toggleVideo,
    toggleAudio,
  };
};
