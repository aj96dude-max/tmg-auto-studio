/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tmg: {
          canvas: '#09090B',      // Deep matte carbon root workspace
          panel: '#121215',       // Slate black docked panels
          surface: '#18181C',     // Dark graphite timeline tracks & inputs
          elevated: '#1F1F24',    // Hover / secondary surface
          border: '#27272A',      // 1px solid structural hairlines
          borderLight: '#3F3F46', // Active border highlight
          cobalt: '#2563EB',      // Primary CTAs & active script/timeline blocks
          cobaltHover: '#1D4ED8',
          emerald: '#10B981',     // Live engine indicators & verified checks
          amber: '#F59E0B',       // Mistake alerts & warnings
          danger: '#EF4444',      // Recording / error indicator
          textPrimary: '#F4F4F5',
          textSecondary: '#A1A1AA',
          textMuted: '#71717A',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'tmg': '4px',
      }
    },
  },
  plugins: [],
}

