'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

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
  }

  const getActiveLabel = () => {
    if (currentLevel === -1) return 'Авто'
    const level = levels.find(l => l.index === currentLevel)
    return level ? level.label : 'Авто'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-base-300 rounded-xl aspect-video">
        <p className="text-base-content/50 text-sm">Не вдалося завантажити відео</p>
      </div>
    )
  }

  return (
    <div>
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        className={`w-full rounded-xl bg-black ${className}`}
      />

      {levels.length > 1 && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs text-base-content/40 mr-1">Якість:</span>
          <button
            onClick={() => switchQuality(-1)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              currentLevel === -1
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/60 hover:bg-base-300'
            }`}
          >
            Авто
          </button>
          {levels.map(level => (
            <button
              key={level.index}
              onClick={() => switchQuality(level.index)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                currentLevel === level.index
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
