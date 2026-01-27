Suropara Frontend - Next.js Setup

1. Installation

Run these commands to initialize the project. You will see interactive prompts; follow the guide below to match the project structure (using JavaScript and src directory):

npx create-next-app@latest suro-frontend



Configuration Guide:

Need to install the following packages:
create-next-app@16.1.2
Ok to proceed? (y) y

✔ Would you like to use the recommended Next.js defaults? … No, customize settings
✔ Would you like to use TypeScript? … No
✔ Which linter would you like to use? … ESLint
✔ Would you like to use React Compiler? … No
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … No (Select 'No' to use the Pages Router structure provided below)
✔ Would you like to customize the default import alias (@/*)? … No



Once the project is created, navigate into the folder and install the required libraries:

cd suro-frontend
npm install axios framer-motion lucide-react clsx tailwind-merge



2. Directory Structure

Organize your src folder like this to separate Logic, UI, and Pages.

/src
├── /components
│   ├── /ui             # Reusable (GlassCard, Buttons)
│   ├── /visuals        # The SVG Engines (CharacterSVG, CabinetSVG)
│   └── /layout         # BottomDock, Navbar
├── /context            # Global State (AuthContext)
├── /hooks              # Game Logic (useSlotMachine)
├── /services           # API Connection (api_service.js)
├── /pages
│   ├── _app.js         # Global Styles & Context Provider
│   ├── index.js        # Login/Register Screen
│   ├── lobby.js        # 3D Island Carousel
│   └── game
│       └── [id].js     # Dynamic Slot Room (e.g., /game/1)
└── /styles
    └── globals.css     # Base Tailwind directives




3. Tailwind Configuration (tailwind.config.js)

Update your config to support the custom "Neon" and "3D" animations.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      colors: {
        neon: {
          blue: '#00f3ff',
          pink: '#ff00ff',
          gold: '#ffd700',
        }
      }
    },
  },
  plugins: [],
}


