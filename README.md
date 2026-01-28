# Suro Frontend

A modern, interactive frontend application for the Suro gaming platform, built with Next.js and React. This project provides a sleek user interface for casino-style games, including slot machines, tournaments, and social features.

## Features

- **Game Components**: Interactive slot machine, daily bonuses, and game views
- **Social Integration**: Chat widgets, referral system, and user profiles
- **UI/UX**: Glass card effects, global tickers, and responsive design with Tailwind CSS
- **Animations**: Smooth animations powered by Framer Motion
- **API Integration**: Axios for backend communication
- **Sound Effects**: Integrated game sounds for enhanced user experience

## Tech Stack

- **Framework**: Next.js 16.1.2
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Linting**: ESLint

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd suro-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Build for production:
   ```bash
   npm run build
   npm run start
   ```

## Project Structure

- `src/components/`: Reusable UI components
  - `game/`: Game-specific components (HallView, PlayView, etc.)
  - `layout/`: Layout components (BottomDock)
  - `social/`: Social features (ChatWidget)
  - `ui/`: UI elements (GlassCard, GlobalTicker)
  - `visuals/`: SVG components (CabinetSVG, CharacterSVG, etc.)
- `src/context/`: React contexts (AuthContext, ToastContext)
- `src/hooks/`: Custom hooks (useGameSound, useSlotMachine)
- `src/pages/`: Next.js pages (_app.js, index.js, etc.)
- `src/services/`: API services
- `src/styles/`: Global styles

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.
