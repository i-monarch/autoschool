export function RoadPattern({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="road-dashes" x="0" y="0" width="60" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            {/* Dashed road marking */}
            <rect x="28" y="10" width="4" height="40" rx="2" fill="currentColor" opacity="0.035" />
            <rect x="28" y="80" width="4" height="40" rx="2" fill="currentColor" opacity="0.035" />
            <rect x="28" y="150" width="4" height="40" rx="2" fill="currentColor" opacity="0.035" />
          </pattern>

          <pattern id="road-signs" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
            {/* Triangle warning sign */}
            <g transform="translate(50, 60)" opacity="0.03">
              <polygon points="20,0 40,35 0,35" fill="none" stroke="currentColor" strokeWidth="3" />
            </g>
            {/* Circle prohibition sign */}
            <g transform="translate(280, 180)" opacity="0.03">
              <circle cx="18" cy="18" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
              <line x1="6" y1="30" x2="30" y2="6" stroke="currentColor" strokeWidth="2.5" />
            </g>
            {/* Speed limit circle */}
            <g transform="translate(140, 320)" opacity="0.025">
              <circle cx="20" cy="20" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
              <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">50</text>
            </g>
            {/* Diamond priority sign */}
            <g transform="translate(340, 40)" opacity="0.03">
              <rect x="4" y="4" width="24" height="24" rx="3" transform="rotate(45, 16, 16)" fill="none" stroke="currentColor" strokeWidth="2.5" />
            </g>
            {/* Pedestrian crossing sign */}
            <g transform="translate(60, 240)" opacity="0.025">
              <polygon points="18,0 36,32 0,32" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <line x1="14" y1="14" x2="14" y2="25" stroke="currentColor" strokeWidth="2" />
              <circle cx="14" cy="11" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <line x1="14" y1="18" x2="10" y2="25" stroke="currentColor" strokeWidth="1.5" />
              <line x1="14" y1="18" x2="18" y2="25" stroke="currentColor" strokeWidth="1.5" />
            </g>
            {/* Octagon stop sign silhouette */}
            <g transform="translate(220, 80)" opacity="0.025">
              <polygon points="12,0 28,0 40,12 40,28 28,40 12,40 0,28 0,12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#road-dashes)" />
        <rect width="100%" height="100%" fill="url(#road-signs)" />
      </svg>
    </div>
  )
}
