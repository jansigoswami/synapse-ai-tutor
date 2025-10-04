Synapse AI Tutor - Project Architecture
Project Structure
synapse-ai-tutor/
├── src/
│   ├── app/                          # Next.js 13+ App Router
│   │   ├── layout.tsx               # Root layout (current)
│   │   ├── page.tsx                 # Home page
│   │   ├── globals.css              # Global styles
│   │   ├── api/                     # API routes
│   │   │   ├── chat/
│   │   │   │   └── route.ts        # Chat API endpoint
│   │   │   ├── tutor/
│   │   │   │   └── route.ts        # Tutor-specific endpoints
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts    # Auth endpoints
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard page
│   │   └── (auth)/                  # Auth route group
│   │       ├── login/
│   │       └── signup/
│   │
│   ├── components/                   # React components
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── layout/                  # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── chat/                    # Chat-related components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ChatHistory.tsx
│   │   └── tutor/                   # Tutor-specific components
│   │       ├── CodeEditor.tsx
│   │       ├── QuizComponent.tsx
│   │       └── ProgressTracker.tsx
│   │
│   ├── lib/                         # Utility functions & configurations
│   │   ├── ai/                      # AI/LLM related
│   │   │   ├── anthropic.ts        # Claude API integration
│   │   │   ├── prompts.ts          # System prompts
│   │   │   └── streaming.ts        # Streaming handlers
│   │   ├── db/                      # Database
│   │   │   ├── prisma.ts           # Prisma client
│   │   │   └── queries.ts          # Database queries
│   │   ├── auth.ts                  # Auth configuration
│   │   ├── utils.ts                 # General utilities
│   │   └── constants.ts             # App constants
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useAuth.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── types/                       # TypeScript types
│   │   ├── chat.ts
│   │   ├── user.ts
│   │   └── tutor.ts
│   │
│   ├── services/                    # Business logic services
│   │   ├── chatService.ts
│   │   ├── tutorService.ts
│   │   └── userService.ts
│   │
│   └── middleware.ts                # Next.js middleware
│
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── images/
│   └── fonts/
│
├── prisma/                          # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
│
├── tests/                           # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local                       # Environment variables
├── .gitignore
├── next.config.js
├── tsconfig.json
├── package.json
├── README.md
└── tailwind.config.js


Directory Descriptions
/src/app
Contains Next.js App Router pages and API routes. This is the entry point for all routes in your application.

/src/components
Reusable React components organized by feature:

ui/: Basic UI components (buttons, inputs, cards)
layout/: Layout components (header, sidebar, footer)
chat/: Chat interface components
tutor/: AI tutor-specific components
/src/lib
Core utilities and configurations:

ai/: AI integration logic (Claude API, prompts, streaming)
db/: Database client and query functions
auth.ts: Authentication configuration
utils.ts: Helper functions
constants.ts: App-wide constants
/src/hooks
Custom React hooks for reusable logic across components.

/src/types
TypeScript type definitions and interfaces for type safety.

/src/services
Business logic layer that orchestrates data flow between components and APIs.

/public
Static assets served directly by Next.js (images, fonts, favicon).

/prisma
Database schema and migration files for Prisma ORM.

/tests
Test files organized by test type (unit, integration, e2e).

Key Benefits
Separation of Concerns: Clear distinction between UI, business logic, and data
Scalability: Easy to add new features without cluttering existing code
Type Safety: Centralized types for better TypeScript support
Reusability: Shared components and hooks reduce code duplication
Maintainability: Easy to locate and update specific functionality
Testing: Dedicated test directory matching source structure
Recommended Technology Stack
Core Framework
Next.js 14+ with App Router
React 18+
TypeScript
Styling
Tailwind CSS
shadcn/ui or Radix UI for component primitives
Database & ORM
Prisma for database ORM
PostgreSQL or MySQL for production database
SQLite for development (optional)
Authentication
NextAuth.js for authentication
Support for OAuth providers (Google, GitHub)
JWT or database sessions
AI Integration
Anthropic Claude API for AI tutor functionality
Streaming responses for better UX
State Management
Zustand or Jotai for global state
React Context API for simple state
SWR or TanStack Query for server state
Validation
Zod for runtime type validation
Form validation with React Hook Form
Testing
Vitest or Jest for unit testing
React Testing Library for component testing
Playwright for e2e testing
Code Quality
ESLint for linting
Prettier for code formatting
Husky for git hooks
lint-staged for pre-commit checks
Environment Variables
Create a .env.local file with the following variables:

env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/synapse"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI API
ANTHROPIC_API_KEY="your-anthropic-api-key"

# App Configuration
NODE_ENV="development"
Getting Started
Clone and Install
bash
   git clone <repository-url>
   cd synapse-ai-tutor
   npm install
Setup Database
bash
   npx prisma generate
   npx prisma migrate dev
Configure Environment
Copy .env.example to .env.local
Fill in required environment variables
Run Development Server
bash
   npm run dev
Build for Production
bash
   npm run build
   npm start
Best Practices
Component Organization
Keep components small and focused
Use composition over inheritance
Extract reusable logic into custom hooks
Type Safety
Define types for all data structures
Use strict TypeScript configuration
Validate API inputs/outputs with Zod
Error Handling
Implement proper error boundaries
Log errors for debugging
Show user-friendly error messages
Performance
Use React.memo for expensive components
Implement code splitting
Optimize images with next/image
Use server components where possible
Security
Never expose API keys in client code
Validate all user inputs
Implement rate limiting for API routes
Use HTTPS in production
Next Steps
Set up the basic project structure
Implement authentication flow
Create chat interface components
Integrate Claude API for AI tutoring
Set up database schema
Implement user progress tracking
Add testing suite
Deploy to production (Vercel recommended)
Resources
Next.js Documentation
Prisma Documentation
Anthropic Claude API
NextAuth.js Documentation
Tailwind CSS Documentation
Last Updated: October 4, 2025
Version: 1.0.0

