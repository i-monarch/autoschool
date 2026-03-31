'use client'

import { X } from 'lucide-react'

interface Props {
  url: string | null
  onClose: () => void
}

export default function ImageLightbox({ url, onClose }: Props) {
  if (!url) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 btn btn-circle btn-sm bg-white/10 border-0 text-white hover:bg-white/20"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={url}
        alt=""
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
