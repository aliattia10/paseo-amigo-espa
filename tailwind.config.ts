import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// New Petflik Color Palette
				'ash-grey': '#C5CFC3',
				'sage-green': '#78B16B',
				'medium-jungle': '#56AB46',
				'white': '#FFFFFF',
				'muted-olive': '#8FBA85',
				// PetFlik Geneva landing palette
				ivory: 'oklch(0.98 0.005 80)',
				'warm-gray': 'oklch(0.95 0.005 80)',
				sage: {
					50: 'oklch(0.97 0.01 150)',
					100: 'oklch(0.94 0.02 150)',
					200: 'oklch(0.88 0.03 150)',
					300: 'oklch(0.78 0.05 150)',
					400: 'oklch(0.65 0.08 150)',
					500: 'oklch(0.55 0.09 150)',
					600: 'oklch(0.48 0.08 150)',
					700: 'oklch(0.42 0.07 150)',
					800: 'oklch(0.35 0.06 150)',
					900: 'oklch(0.28 0.05 150)',
				},
				terra: {
					50: 'oklch(0.96 0.02 50)',
					100: 'oklch(0.92 0.04 50)',
					200: 'oklch(0.85 0.07 45)',
					300: 'oklch(0.78 0.10 40)',
					400: 'oklch(0.70 0.12 38)',
					500: 'oklch(0.62 0.13 35)',
					600: 'oklch(0.55 0.12 35)',
				},
				
				// Stitch Design System - Exact Colors from HTML Files
				// Welcome Page Colors
				'welcome-primary': '#FFC107',
				'welcome-background-light': '#FAF8F1',
				'welcome-background-dark': '#112117',
				'welcome-text-light': '#333333',
				'welcome-text-dark': '#FAF8F1',
				'welcome-accent-light': '#56AB46', // Updated to medium-jungle
				'welcome-accent-dark': '#FFC107',
				
				// Role Selection Colors
				'role-primary': '#78B16B', // Updated to sage-green
				'role-background-light': '#f6f8f7',
				'role-background-dark': '#112117',
				'role-text-light': '#4A4A4A',
				'role-text-dark': '#E0E0E0',
				'role-button-secondary': '#56AB46', // Updated to medium-jungle
				
				// Home Feed Colors
				'home-primary': '#56AB46', // Updated to medium-jungle
				'home-background-light': '#f6f8f7',
				'home-background-dark': '#112117',
				
				// Profile & Search Colors (Main App Colors) - Updated to new palette
				'primary': '#56AB46', // medium-jungle
				'secondary': '#78B16B', // sage-green
				'background-light': '#F2F2F7',
				'background-dark': '#1C1C1E',
				'text-primary-light': '#1C1C1E',
				'text-primary-dark': '#FFFFFF',
				'text-secondary-light': '#8E8E93',
				'text-secondary-dark': '#8E8E93',
				'card-light': '#FFFFFF',
				'card-dark': '#2C2C2E',
				'border-light': '#E5E5EA',
				'border-dark': '#3A3A3C',
				'primary-bg-light': '#D8E7F9',
				'primary-bg-dark': 'rgba(74, 144, 226, 0.2)',
				
				// Legacy Stitch Colors (for compatibility) - Updated to new palette
				'stitch-primary': '#56AB46', // medium-jungle
				'stitch-secondary': '#78B16B', // sage-green
				'stitch-bg-light': '#F2F2F7',
				'stitch-bg-dark': '#1C1C1E',
				'stitch-text-primary-light': '#1C1C1E',
				'stitch-text-primary-dark': '#F2F2F7',
				'stitch-text-secondary-light': '#8E8E93',
				'stitch-text-secondary-dark': '#8E8E93',
				'stitch-border-light': '#E5E5EA',
				'stitch-border-dark': '#3A3A3C',
				'stitch-card-light': '#FFFFFF',
				'stitch-card-dark': '#2C2C2E',
				
				// Legacy shadcn colors (for compatibility)
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#56AB46', // medium-jungle
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: '#78B16B', // sage-green
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: 'hsl(var(--card-foreground))'
				},
				neutral: {
					bg: 'hsl(var(--neutral-bg))',
					text: 'hsl(var(--neutral-text))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				'display': ['"Plus Jakarta Sans"', 'sans-serif'],
				'serif': ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
			},
			borderRadius: {
				'DEFAULT': '0.5rem',      // Stitch default
				'lg': '1rem',              // Stitch lg
				'xl': '1.5rem',            // Stitch xl
				'2xl': '1rem',             // For compatibility
				'3xl': '1.5rem',           // For compatibility
				'full': '9999px',          // Stitch full
				'md': 'calc(var(--radius) - 2px)',  // Legacy
				'sm': 'calc(var(--radius) - 4px)'   // Legacy
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
