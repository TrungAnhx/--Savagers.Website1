import { useEffect, useRef } from 'react';

interface AmbientVideoProps {
  src: string;
  className: string;
  opacityClassName?: string;
}

export default function AmbientVideo({ src, className, opacityClassName }: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = () => {
      if (document.hidden) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        key={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        style={{ willChange: 'transform, opacity' }}
        className={className}
      >
        <source src={src} type="video/mp4" />
      </video>
      {opacityClassName ? <div className={opacityClassName}></div> : null}
    </>
  );
}
