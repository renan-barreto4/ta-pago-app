# Tá Pago - Fitness Tracking App

## Overview
"Tá Pago" is a Brazilian Portuguese fitness tracking application built with React, TypeScript, Vite, and Tailwind CSS. The app allows users to track workouts, monitor weight, view statistics, and manage fitness routines with a clean, mobile-first interface.

## Current State
- **Status**: Fully functional frontend-only application
- **Language**: Brazilian Portuguese
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Storage**: Currently using localStorage (frontend-only)
- **Port**: Configured to run on port 5000 for Replit environment

## Project Architecture
### Frontend Structure
- `src/components/` - UI components including workout calendar, modals, stats cards
- `src/pages/` - Main pages (Index, NotFound)
- `src/hooks/` - Custom React hooks for data management
- `src/lib/` - Utility functions
- `public/` - Static assets

### Key Features
1. **Workout Calendar** - Visual calendar for tracking daily workouts
2. **Weight Tracker** - Monitor weight changes over time
3. **Statistics Dashboard** - View workout statistics and trends
4. **Workout Types** - Manage different types of exercises
5. **Mobile-First Design** - Optimized for mobile devices with bottom navigation

## Technology Stack
- **React 18.3.1** with TypeScript
- **Vite 5.4.19** for build tooling and dev server
- **Tailwind CSS 3.4.17** for styling
- **Shadcn/ui** components built on Radix UI
- **React Query (TanStack)** for state management
- **React Hook Form** for form handling
- **Lucide React** for icons
- **Date-fns** for date manipulation

## Development Setup
### Running Locally
```bash
npm install --legacy-peer-deps  # Due to date-fns version conflicts
npm run dev                     # Starts development server on port 5000
```

### Build for Production
```bash
npm run build                   # Creates production build
npm run preview                 # Preview production build
```

## Replit Configuration
- **Workflow**: "Start application" running `npm run dev`
- **Port**: 5000 (configured for Replit proxy)
- **Host**: 0.0.0.0 (allows external connections)
- **Deployment**: Autoscale configuration set up for production

## Future Plans
According to `backend.md`, there are plans to:
1. Migrate from Vite to Next.js
2. Add backend functionality with PostgreSQL database
3. Implement user authentication with Next-Auth.js
4. Replace localStorage with proper database storage
5. Add server-side API routes

## Recent Changes
- **2024-09-24**: Initial Replit setup
  - Configured Vite to run on port 5000 with host 0.0.0.0
  - Installed dependencies with legacy peer deps flag
  - Set up workflow for Replit environment
  - Configured deployment for autoscale
  - Verified application runs successfully

## User Preferences
- Brazilian Portuguese language interface
- Mobile-first design approach
- Local storage for data persistence (current implementation)
- Clean, modern UI with gradient backgrounds and card-based design