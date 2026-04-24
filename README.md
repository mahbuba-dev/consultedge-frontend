# ConsultEdge Frontend

ConsultEdge is a multi-role expert consultation marketplace built with Next.js. It helps clients find verified experts, book paid consultation sessions, collaborate through realtime chat and video calls, and complete the full consultation lifecycle inside one product.

This frontend supports three distinct product experiences:

- Client workspace for discovery, booking, payment, chat, calls, and reviews
- Expert workspace for profile growth, availability management, sessions, reviews, and operational workflows
- Admin workspace for moderation, verification, bookings oversight, industry management, and platform operations

## Problem This Project Solves

ConsultEdge addresses a common product gap in expert services: discovery, scheduling, payments, communication, and moderation often live in separate tools. That creates friction for clients, fragmented operations for experts, and weak visibility for admins.

ConsultEdge solves that by bringing the consultation journey into one platform:

- expert discovery with filtering and trust signals
- structured booking and rescheduling
- payment initiation and redirect handling
- realtime chat and attachments
- video consultation sessions
- reviews and moderation flows
- role-based dashboards for clients, experts, and admins

## Product Overview

The application is a Next.js App Router frontend for an expert consultation marketplace. Users can browse experts by industry, book sessions, communicate in chat rooms tied to consultations, join secure calls, and leave reviews after sessions. Experts manage availability and client sessions, while admins manage platform quality and business operations.

Primary product message from the app metadata:

> Connect with verified experts and get guidance that gives you a real advantage.

## Core User Journeys

### Clients

- Explore experts and industries
- View expert profiles and expertise
- Book consultations with pay-now or pay-later flows
- Open message rooms with experts
- Join consultation calls
- Track consultations by status
- Submit one review per consultation after completion

### Experts

- Apply as an expert
- Manage profile and verification-related information
- Publish and manage availability slots
- View upcoming, completed, and missed sessions
- Chat with clients in consultation rooms
- Start and manage consultation calls
- View and reply to reviews

### Admins

- Moderate experts, clients, and bookings
- Review and verify expert applications
- Manage industries
- Moderate testimonials and visibility
- Monitor platform conversations and support operations

## Key Features

### Expert Discovery

- public expert listing with search, sort, verification filtering, industry filtering, price filters, and experience filters
- expert detail pages with booking entry points
- industry browsing for category-led discovery

### Consultation Lifecycle

- consultation booking
- pay-now and pay-later flows
- payment redirect handling for success, failed, and cancelled outcomes
- rescheduling against real availability slots
- status-aware consultation cards and lists

### Realtime Communication

- per-room messaging between participants
- attachment upload support
- typing indicators
- unread-state handling
- emoji reactions on messages
- websocket transport with polling fallback

### Video Session Experience

- WebRTC-based consultation calling
- incoming and outgoing call states
- secure session UI for active calls

### Reviews and Moderation

- client testimonial submission after consultations
- one-review-per-consultation behavior
- expert reply capability
- admin moderation workflows for testimonial visibility

### Expert Operations

- availability and slot publishing
- session management
- expert review dashboard
- earnings and dashboard insight surfaces

### Admin Operations

- expert verification management
- bookings management
- client and expert management
- review moderation
- industry management
- admin message oversight

## Technical Highlights

### Modern App Architecture

- Next.js 16 App Router
- React 19
- TypeScript across domain models and service boundaries
- React Query for server-state caching and invalidation
- client and server component composition across route groups

### Realtime Design

ConsultEdge uses a hybrid chat architecture:

- native WebSocket transport for live chat events
- REST APIs for message fetch, send, attachment upload, and mutation fallback
- automatic polling fallback when the socket is unavailable
- heartbeat and reconnect behavior for reliability
- room subscription lifecycle to limit unnecessary traffic

### Domain-Focused Frontend Services

The frontend is organized around feature services rather than a thin generic API layer only. Important service areas include:

- auth
- bookings and payment initiation
- expert availability
- chat rooms and message normalization
- testimonials and moderation
- dashboard data
- industries

### Role-Based Experience

The application is structured around route groups for different product contexts:

- public marketing and discovery routes
- protected client dashboard routes
- protected expert dashboard routes
- protected admin dashboard routes

## Tech Stack

### Framework and Runtime

- Next.js 16.2.1
- React 19.2.4
- TypeScript 5
- Bun-based local scripts

### State, Data, and Validation

- @tanstack/react-query
- @tanstack/react-query-next-experimental
- @tanstack/react-form
- Zod
- Axios

### UI and UX

- Tailwind CSS 4
- Radix UI primitives
- shadcn/ui component patterns
- Lucide React icons
- Sonner toasts
- next-themes
- Framer Motion
- Recharts

### Communication and Media

- native WebSocket client for chat transport
- socket.io-client available in the dependency graph
- native WebRTC for calls

## System Architecture Diagram

```mermaid
graph TB
    subgraph Browser["Browser (Client Device)"]
        UI["Next.js Frontend\nReact 19 · App Router"]
    end

    subgraph Frontend_Layers["Frontend Layers"]
        direction TB
        Pages["Pages & Route Groups\n(commonLayout · dashboardLayout)"]
        Components["UI Components\n(shadcn/ui · Radix · Tailwind)"]
        Hooks["Custom Hooks\n(useRoomMessages · useWebRTCCall\nusePresence · useTyping)"]
        Providers["Providers\n(QueryProvider · ChatSocketProvider\nThemeProvider)"]
        Services["Service Layer\n(auth · bookings · chatRoom\nexpertAvailability · testimonials)"]
        ReactQuery["TanStack React Query\n(server state · caching · optimistic UI)"]
    end

    subgraph Realtime["Realtime Transport"]
        WS["WebSocket\n/ws/chat\nHeartbeat · Reconnect · Backoff"]
        Poll["REST Polling\nFallback 4s interval"]
    end

    subgraph Backend["Backend API\n(Node.js · Express · TypeScript)"]
        REST["REST API\n/api/v1/**"]
        SocketServer["Socket.io Server\nRoom subscriptions · Events"]
        DB["PostgreSQL\n(Prisma ORM)"]
        Auth["JWT Auth\nAccess + Refresh tokens"]
    end

    subgraph External["External Services"]
        Stripe["Stripe\nPayment processing"]
        Cloudinary["Cloudinary\nImage hosting"]
        STUN["Google STUN\nWebRTC peer discovery"]
    end

    UI --> Pages
    Pages --> Components
    Pages --> Hooks
    Hooks --> Services
    Hooks --> ReactQuery
    Services --> ReactQuery
    UI --> Providers
    Providers --> WS
    WS -->|"events: message_new\nmessage_reaction_updated\ntyping · presence"| SocketServer
    Services -->|"HTTP REST"| REST
    REST --> DB
    REST --> Auth
    SocketServer --> DB
    WS -.->|"fallback when\ndisconnected"| Poll
    Poll --> REST
    Services -->|"payment initiation"| Stripe
    Services -->|"image uploads"| Cloudinary
    Hooks -->|"SDP signaling\nover WebSocket"| WS
    Hooks -->|"ICE negotiation"| STUN
```

## Feature Flow Diagram

### Consultation Lifecycle

```mermaid
flowchart TD
    A([Client visits /experts]) --> B[Browse & filter experts]
    B --> C[View expert profile]
    C --> D{Book consultation}
    D -->|Pay now| E[Initiate Stripe payment]
    D -->|Pay later| F[Book with UNPAID status]
    E --> G{Payment result}
    G -->|Success| H[Consultation CONFIRMED]
    G -->|Failed / Cancel| I[Payment failed page]
    F --> H
    H --> J[Chat room opens\nbetween client and expert]
    J --> K{Session time arrives}
    K --> L[Join session modal\nunlocks 2 min before start]
    L --> M[WebRTC call initiated]
    M --> N[Active consultation call\nCallPanel · local + remote video]
    N --> O{Expert ends session}
    O --> P[Consultation COMPLETED]
    P --> Q[Review prompt shown to client]
    Q --> R[Client submits review\nrating + comment]
    R --> S[Review PENDING moderation]
    S -->|Admin approves| T[Review APPROVED · visible publicly]
    S -->|Admin hides| U[Review HIDDEN]
    T --> V[Expert can reply to review]
```

### Realtime Chat Flow

```mermaid
flowchart TD
    A([User opens chat room]) --> B[ChatSocketProvider\nmounts and connects]
    B --> C{WebSocket\nconnection state}
    C -->|connected| D[Subscribe to room\ntoggle_reaction · send via socket]
    C -->|reconnecting| E[Exponential backoff\n1s → 2s → 4s → 20s max]
    C -->|disconnected| F[Fallback: REST poll\nevery 4 seconds]
    E --> C
    F --> G[getRoomMessages via HTTP]

    D --> H[User types message]
    H --> I[Optimistic message added\nto cache instantly]
    I --> J[POST /chat/rooms/:id/messages]
    J -->|success| K[Confirmed message\nreplaces optimistic]
    J -->|fail| L[Optimistic rolled back]

    D --> M[User clicks emoji reaction]
    M --> N[Optimistic reaction\napplied to cache]
    N -->|socket connected| O[emit toggle_reaction\nroomId · messageId · emoji]
    N -->|socket down| P[POST /messages/:id/reactions]
    O --> Q[Server broadcasts\nmessage_reaction_updated]
    Q --> R[Cache updated with\nserver-confirmed reactions]
    P -->|fail| S[Reaction rolled back\ntoast error shown]
```

### Admin Moderation Flow

```mermaid
flowchart LR
    A([Expert registers]) --> B[Applies as expert\n/apply-expert]
    B --> C[Status: PENDING]
    C --> D[Admin reviews at\nexpert-verification page]
    D -->|Approves| E[Status: APPROVED\nExpert visible in listings]
    D -->|Rejects| F[Status: REJECTED\nOptional admin note]

    G([Client submits review]) --> H[Status: PENDING]
    H --> I[Admin views at\nreviews-management page]
    I -->|Approves| J[Status: APPROVED\nVisible on expert profile]
    I -->|Hides| K[Status: HIDDEN\nNot visible publicly]
    J --> L[Expert can reply\nto approved review]
```

## Project Structure

This repository is the frontend application. The codebase is organized around reusable modules, route groups, hooks, providers, and service layers.

```text
consultedge-frontend/
|- src/
|  |- app/
|  |  |- (commonLayout)/
|  |  |- (dashboardLayout)/
|  |- hooks/
|  |- lib/
|  |- providers/
|  |- services/
|  |- types/
|- components/
|  |- modules/
|  |- ui/
|- public/
|- README.md
```

## Important Route Areas

### Public

- `/`
- `/experts`
- `/experts/[id]`
- `/industries`
- `/apply-expert`
- `/contact`
- auth route group for login, register, verify-email, and password reset

### Client Dashboard

- `/dashboard`
- `/dashboard/consultations`
- `/dashboard/chat`
- payment result pages under `/dashboard/payment/*`

### Expert Dashboard

- `/expert/dashboard`
- `/expert/dashboard/messages`
- `/expert/dashboard/my-sessions`
- `/expert/dashboard/my-reviews`
- `/expert/dashboard/set-availability`

### Admin Dashboard

- `/admin/dashboard`
- `/admin/dashboard/expert-verification`
- `/admin/dashboard/reviews-management`
- `/admin/dashboard/bookings-management`
- `/admin/dashboard/industries-management`
- `/admin/dashboard/messages`

## Local Development

### Prerequisites

- Node.js or Bun
- access to the matching backend API
- environment variables configured in `.env` or `.env.local`

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The project script uses Bun under the hood:

```bash
bun --bun next dev
```

### Production build

```bash
npm run build
npm run start
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Environment Notes

The frontend expects a backend API base URL through environment configuration. The HTTP client normalizes the base URL to the `/api/v1` API root.

At minimum, configure:

```env
NEXT_PUBLIC_API_BASE_URL=
```

Additional auth and backend environment requirements depend on the paired backend project.

## Architecture Notes

### Data Fetching

- React Query is used for cached API data, optimistic UI updates, and invalidation after mutations.
- Query providers are mounted at the app level, with dashboard-safe query boundaries where needed.

### Authentication

- JWT and cookie-aware request handling
- role-sensitive route behavior
- UI flows for email verification, password reset, and profile-aware user handling

### Messaging Reliability

- websocket-first chat behavior
- polling fallback when disconnected
- message normalization for inconsistent backend response envelopes
- reaction and message state updates through cache replacement rather than full reloads

## Why This Project Stands Out

ConsultEdge is not just a landing page plus dashboard. It is a workflow-driven product frontend that combines:

- marketplace discovery
- trust and moderation
- operational dashboards
- realtime collaboration
- session execution
- post-session feedback loops

That makes it useful for teams building expert networks, advisory marketplaces, consultation businesses, or vertical service platforms where trust, scheduling, and communication need to work together.

## Current Focus Areas Reflected in the Codebase

Recent implementation work in this frontend has focused on:

- improving consultation state transitions without page reloads
- making expert and client dashboards respond instantly to cache updates
- strengthening review visibility and moderation flows
- improving chat reliability, history loading, and message reactions
- making key surfaces more responsive on smaller screens

## Contributing

If you plan to extend the project, keep changes aligned with the existing architecture:

- prefer feature-level services for API integration
- use React Query for server-state synchronization
- preserve role-based route boundaries
- keep optimistic UI behavior tied to defined reconciliation paths

## License

No explicit license is defined in this frontend repository. Add one if the project is intended for public distribution.

## Author

Mahbuba Akter  
Full-Stack Web Developer  
