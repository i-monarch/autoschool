/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        autoschool: {
          'primary': '#16a34a',          // green-600 — main actions
          'primary-content': '#ffffff',
          'secondary': '#2563eb',        // blue-600 — links, info
          'secondary-content': '#ffffff',
          'accent': '#f59e0b',           // amber-500 — highlights
          'accent-content': '#1c1917',
          'neutral': '#1f2937',          // gray-800
          'neutral-content': '#f3f4f6',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',         // slate-50
          'base-300': '#e2e8f0',         // slate-200
          'base-content': '#1e293b',     // slate-800
          'info': '#3b82f6',             // blue-500
          'info-content': '#ffffff',
          'success': '#22c55e',          // green-500
          'success-content': '#ffffff',
          'warning': '#eab308',          // yellow-500
          'warning-content': '#1c1917',
          'error': '#ef4444',            // red-500
          'error-content': '#ffffff',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1rem',
          '--btn-text-case': 'none',
        },
      },
    ],
    darkTheme: false,
  },
}
