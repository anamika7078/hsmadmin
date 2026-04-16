import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: '#F8FAFC',
  			foreground: '#0F172A',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#0F172A'
  			},
  			popover: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#0F172A'
  			},
  			primary: {
  				DEFAULT: '#3B82F6',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#F59E0B',
  				foreground: '#FFFFFF'
  			},
  			muted: {
  				DEFAULT: '#F1F5F9',
  				foreground: '#64748B'
  			},
  			accent: {
  				DEFAULT: '#F1F5F9',
  				foreground: '#0F172A'
  			},
  			destructive: {
  				DEFAULT: '#EF4444',
  				foreground: '#F8FAFC'
  			},
  			border: '#E2E8F0',
  			input: '#E2E8F0',
  			ring: '#3B82F6',
  			chart: {
  				'1': '#3B82F6',
  				'2': '#F59E0B',
  				'3': '#10B981',
  				'4': '#8B5CF6',
  				'5': '#EC4899'
  			},
  			sidebar: {
  				background: '#0A0F1E',
  				foreground: '#F8FAFC',
  				primary: '#3B82F6',
  				'primary-foreground': '#FFFFFF',
  				accent: '#1E293B',
  				'accent-foreground': '#F8FAFC',
  				border: '#1E293B',
  				ring: '#3B82F6'
  			}
  		},
  		borderRadius: {
  			'2xl': '1rem',
  			xl: '0.75rem',
  			lg: '0.5rem',
  			md: '0.375rem',
  			sm: '0.25rem'
  		},
  		boxShadow: {
  			'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.03)',
  			'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

