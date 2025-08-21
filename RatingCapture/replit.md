# Overview

This is a full-stack feedback collection system built with a React frontend, Express.js backend, and PostgreSQL database. The application allows users to submit feedback with ratings (1-5 stars) and comments, then view and filter submitted feedback. The system includes both a modern React SPA component and a static HTML version with a feminine-themed design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a dual frontend approach:
- **React SPA**: Built with Vite, TypeScript, and modern React patterns including React Query for data fetching
- **Static HTML**: A standalone feedback form with vanilla JavaScript for direct user interaction
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives and Tailwind CSS styling
- **Routing**: wouter for lightweight client-side routing

The React app primarily serves as a redirect mechanism to the static HTML feedback form, allowing for a hybrid approach where the main interface is the static page.

## Backend Architecture
- **Express.js**: RESTful API server with TypeScript
- **Route Structure**: Modular route registration with dedicated feedback endpoints
- **Storage Layer**: Abstracted storage interface with in-memory implementation (designed for easy database integration)
- **Validation**: Zod schema validation for request data
- **Development**: Hot reload with Vite integration for full-stack development

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Two main entities - users and feedbacks
- **Feedback Model**: Stores name, rating (1-5), optional comments, and timestamps
- **User Model**: Basic user structure with username/password (prepared for authentication)

## API Structure
- `GET /api/feedbacks`: Retrieve all feedback entries, sorted by creation date
- `POST /api/feedbacks`: Create new feedback with validation
- RESTful design patterns with proper HTTP status codes and error handling

## Styling and Design
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Design Tokens**: CSS variables for consistent theming with primary/secondary colors
- **Responsive Design**: Mobile-first approach with proper viewport handling
- **Theme**: Feminine color palette with pink/purple gradients and modern glassmorphism effects

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (Neon DB integration)
- **drizzle-orm & drizzle-kit**: Type-safe database ORM and migrations
- **express**: Web server framework
- **vite**: Build tool and development server
- **@tanstack/react-query**: Data fetching and state management

## UI and Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives (dialog, select, toast, etc.)
- **class-variance-authority**: Type-safe variant management for components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **cmdk**: Command palette component

## Form and Validation
- **react-hook-form & @hookform/resolvers**: Form handling and validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation
- **zod**: Schema validation library

## Development Tools
- **typescript**: Type safety across the stack
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **esbuild**: Fast JavaScript bundler for production builds

## Additional Libraries
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation utilities
- **clsx & tailwind-merge**: Utility for conditional CSS classes
- **embla-carousel-react**: Carousel component functionality