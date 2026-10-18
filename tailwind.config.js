/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        forest: {
          DEFAULT: '#22C55E', // Vivid Light Green
          dark: '#16A34A',    // Medium Light Green for active/hover states
          light: '#4ADE80',   // Bright Mint Light Green
          vibrant: '#22C55E', // Electric Light Green
          emerald: '#27C865',
          sage: '#DCFCE7',    // Light Green 100 for subtle badges/pills
          'sage-dark': '#BBF7D0', // Light Green 200
          'pale-surface': '#F0FDF4', // Very soft light green tint (50)
        },
        electric: {
          DEFAULT: '#FF6B00', // Radiant Electric Orange
          hover: '#EA580C',
          light: '#FF8A33',
          glow: 'rgba(255, 107, 0, 0.4)',
        },
        brand: {
          forest: '#22C55E',
          'forest-dark': '#16A34A',
          'forest-light': '#4ADE80',
          emerald: '#22C55E',
          sage: '#DCFCE7',
          'pale-surface': '#F0FDF4',
          orange: '#FF6B00',
          'orange-light': '#FF8A33',
          'dark-bg': '#060B08',
          'dark-surface': '#0E1712',
          'dark-elevated': '#14221A',
          'dark-border': '#1A3323',
          'dark-text': '#F0F5F1',
          'light-bg': '#F4F7F6',
          'light-text': '#17251D',
          // Aliases for smooth migration
          primary: '#22C55E',
          copper: '#FF6B00',
          'copper-light': '#FF8A33',
          burgundy: '#22C55E',
          'burgundy-light': '#4ADE80',
          'secondary-text': '#5C7265',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
          elevated: 'var(--surface-elevated)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        sidebar: {
          background: 'var(--sidebar-bg)',
          foreground: 'var(--sidebar-fg)',
          muted: 'var(--sidebar-muted)',
          active: 'var(--sidebar-active)',
          border: 'var(--sidebar-border)',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
          info: 'var(--status-info)',
        }
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(16, 29, 22, 0.04)',
        card: '0 2px 8px -1px rgba(16, 29, 22, 0.05), 0 1px 3px -1px rgba(16, 29, 22, 0.03)',
        ambient: '0 8px 32px -4px rgba(23, 107, 69, 0.08), 0 2px 8px -2px rgba(16, 29, 22, 0.04)',
        dropdown: '0 12px 24px -4px rgba(16, 29, 22, 0.12), 0 4px 8px -2px rgba(16, 29, 22, 0.06)',
        glow: '0 0 20px -3px rgba(33, 140, 82, 0.35)',
      },
    },
  },
  plugins: [],
}
