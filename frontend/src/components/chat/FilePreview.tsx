'use client'

import { X, FileText } from 'lucide-react'

interface FileItem {
  file: File
  preview?: string
}

interface Props {
  files: FileItem[]
  onRemove: (index: number) => void
}

export default function FilePreview({ files, onRemove }: Props) {
  if (files.length === 0) return null

  return (
    <div className="flex gap-2 px-3 py-2 border-t border-base-300/40 overflow-x-auto">
      {files.map((item, i) => (
        <div key={i} className="relative flex-shrink-0 group">
          {item.preview ? (
            <img
              src={item.preview}
              alt={item.file.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-base-200 flex flex-col items-center justify-center gap-0.5">
              <FileText className="w-5 h-5 text-base-content/40" />
              <span className="text-[9px] text-base-content/40 truncate max-w-[3.5rem] px-0.5">
                {item.file.name.split('.').pop()?.toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 btn btn-circle btn-xs bg-base-300 border-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
