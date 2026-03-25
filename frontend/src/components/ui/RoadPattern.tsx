export function RoadDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Road going to bottom-right corner */}
      <svg
        className="absolute -bottom-10 -right-10 w-[500px] h-[500px] text-base-content opacity-[0.025]"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Road surface */}
        <path
          d="M200 0 C250 150, 350 300, 510 380"
          stroke="currentColor"
          strokeWidth="80"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center dashes */}
        <path
          d="M200 0 C250 150, 350 300, 510 380"
          stroke="white"
          strokeWidth="4"
          strokeDasharray="20 15"
          fill="none"
          opacity="0.4"
        />
        {/* Road edge lines */}
        <path
          d="M162 0 C212 150, 312 300, 472 380"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        <path
          d="M238 0 C288 150, 388 300, 548 380"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
      </svg>

      {/* Single decorative sign in top-right area */}
      <svg
        className="absolute top-8 right-8 w-16 h-16 text-base-content opacity-[0.03]"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" />
        <text x="24" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">50</text>
      </svg>
    </div>
  )
}
