# Medical Invoice System

## Overview

A web-based medical invoice generation system designed for Malkani Health of Electrohomeopathy & Research Centre. The application enables users to select medicines from a pre-populated list, add them to a cart with quantities, enter patient information, and generate professional PDF invoices. The system features a clean, medical-themed interface with a two-page workflow: medicine selection and invoice generation with PDF download capability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom medical theme

**Design System:**
- Custom color scheme with professional green primary colors (HSL: 142 76% 36%) matching medical aesthetic
- Material Design-inspired form inputs and data tables
- Consistent spacing using Tailwind units (3, 4, 6, 8, 12)
- Inter/Roboto typography for professional appearance
- Card-based layouts with rounded corners and subtle shadows

**State Management:**
- React Query handles server data fetching and caching for medicines
- LocalStorage persists cart data between pages
- React hooks (useState) for local component state
- Form validation using Zod schemas with react-hook-form integration

**Routing Strategy:**
- Two main routes: `/` (medicine selection) and `/invoice` (invoice generation)
- Cart data passed via localStorage between routes
- 404 fallback for unknown routes

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type safety
- ESM module system throughout the codebase
- Custom middleware for request logging and JSON body parsing

**API Design:**
- RESTful endpoints following resource-based patterns
- `/api/medicines` - GET all medicines, GET by ID
- `/api/invoices` - POST to create new invoice records
- JSON request/response format with Zod validation
- Error handling with appropriate HTTP status codes (400 for validation, 404 for not found, 500 for server errors)

**Data Layer:**
- Drizzle ORM configured for PostgreSQL dialect
- Schema-first approach with TypeScript type inference
- In-memory storage implementation (MemStorage class) for development/testing
- Interface-based storage abstraction (IStorage) allows easy swapping to database persistence

**Development Workflow:**
- Vite middleware integration for HMR in development
- Separate build process for client (Vite) and server (esbuild)
- TypeScript compilation checking without emit

### Data Models

**Medicine Schema:**
- Fields: id (UUID), name (text), price (decimal 10,2), stockQuantity (integer)
- Sample data pre-populated with 20+ common medical items
- Prices stored as decimal strings for precision

**Invoice Schema:**
- Fields: id, billNumber, issueDate, client details (name, address, phone)
- Items array containing cart items (medicineId, name, quantity, rate, amount)
- Financial fields: subtotal, taxPercentage, taxAmount, totalDue (all decimal 10,2)
- Timestamp tracking with createdAt field

**Cart Item Schema:**
- Nested within invoices as JSON array
- Validated with Zod schema for type safety
- Denormalized medicine data (name, rate) for invoice immutability

### External Dependencies

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components (accordion, dialog, dropdown, select, toast, etc.)
- Shadcn/ui as component library built on Radix
- Lucide React for consistent iconography
- class-variance-authority for component variant styling

**PDF Generation:**
- jsPDF library for client-side PDF creation
- Custom PDF template matching invoice design with green header
- Professional layout with clinic branding

**Database & ORM:**
- Drizzle ORM for type-safe database operations
- Drizzle Kit for schema migrations
- @neondatabase/serverless for PostgreSQL connectivity
- Connection configured via DATABASE_URL environment variable

**Form Handling:**
- react-hook-form for performant form state management
- @hookform/resolvers for Zod schema validation integration
- Native HTML5 validation as fallback

**Styling Tools:**
- Tailwind CSS with PostCSS processing
- Autoprefixer for browser compatibility
- Custom CSS variables for theme customization
- clsx and tailwind-merge for conditional className handling

**Development Tools:**
- tsx for TypeScript execution in development
- esbuild for production server bundling
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer and dev-banner for Replit integration

**Type Safety:**
- Zod for runtime validation and type inference
- drizzle-zod for generating Zod schemas from Drizzle tables
- TypeScript strict mode enabled across entire codebase

**Session & Storage:**
- connect-pg-simple for PostgreSQL session storage (prepared but not actively used)
- localStorage for client-side cart persistence

**Utilities:**
- date-fns for date formatting and manipulation
- nanoid for generating unique identifiers
- embla-carousel-react for potential carousel UI elements