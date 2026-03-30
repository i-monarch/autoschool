'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface HlsPlayerProps {
  src: string
  poster?: string
  className?: string
}

export default function HlsPlayer({ src, poster, className = '' }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      })
      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(true)
        }
      })

      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else {
      setError(true)
    }
  }, [src])

  if (error) {
    return (
      <div className="flex items-center justify-center bg-base-300 rounded-xl aspect-video">
        <p className="text-base-content/50 text-sm">Не вдалося завантажити відео</p>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      playsInline
      className={`w-full rounded-xl bg-black ${className}`}
    />
  )
}
