'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Settings } from 'lucide-react'

interface HlsPlayerProps {
  src: string
  poster?: string
  className?: string
}

interface QualityLevel {
  index: number
  height: number
  label: string
}

export default function HlsPlayer({ src, poster, className = '' }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [error, setError] = useState(false)
  const [levels, setLevels] = useState<QualityLevel[]>([])
  const [currentLevel, setCurrentLevel] = useState(-1)
  const [showQuality, setShowQuality] = useState(false)

  const onLevelsLoaded = useCallback(() => {
    const hls = hlsRef.current
    if (!hls) return
    const parsed = hls.levels.map((level, index) => ({
      index,
      height: level.height,
      label: `${level.height}p`,
    }))
    setLevels(parsed)
    setCurrentLevel(hls.currentLevel)
  }, [])

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

      hls.on(Hls.Events.MANIFEST_PARSED, onLevelsLoaded)
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentLevel(data.level)
      })

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
  }, [src, onLevelsLoaded])

  const switchQuality = (levelIndex: number) => {
    const hls = hlsRef.current
    if (!hls) return
    hls.currentLevel = levelIndex
    setCurrentLevel(levelIndex)
    setShowQuality(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-base-300 rounded-xl aspect-video">
        <p className="text-base-content/50 text-sm">Не вдалося завантажити відео</p>
      </div>
    )
  }

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        className={`w-full rounded-xl bg-black ${className}`}
      />

      {levels.length > 1 && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setShowQuality(!showQuality)}
            className="btn btn-sm btn-circle bg-black/60 border-0 text-white hover:bg-black/80"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showQuality && (
            <div className="absolute top-10 right-0 bg-black/85 backdrop-blur-sm rounded-lg overflow-hidden min-w-[120px]">
              <button
                onClick={() => switchQuality(-1)}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                  currentLevel === -1 ? 'text-primary font-medium' : 'text-white'
                }`}
              >
                Авто
              </button>
              {levels.map(level => (
                <button
                  key={level.index}
                  onClick={() => switchQuality(level.index)}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                    currentLevel === level.index ? 'text-primary font-medium' : 'text-white'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
