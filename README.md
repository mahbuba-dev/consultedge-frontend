
# 🚀 ConsultEdge Frontend

🔗 Live Demo: https://consultedge-frontend.vercel.app

ConsultEdge is a multi-role expert consultation marketplace built with Next.js. It enables users to discover verified experts, book paid consultations, communicate in realtime, and complete end-to-end consultation workflows inside a single unified platform.

It supports three core roles:
- 🧑 Clients
- 🧑‍💼 Experts
- 🛡️ Admins

---

## ⭐ Core Features

- 🔔 Live notifications for bookings, messages, and system updates  
- 🤖 AI chatbot assistant for platform guidance and support  
- 🧠 AI-powered recommendations for expert matching  
- 🧑‍💼 Expert application & onboarding system  
- 💬 Realtime chat system (WebSocket + fallback polling)  
- 🎥 Live consultation sessions using WebRTC  
- 💳 Payment integration (Stripe-ready architecture)  
- ⭐ Reviews & rating system with moderation flow  
- 🧑‍💻 Role-based dashboards for Clients, Experts, and Admins  

---

## 📌 Problem This Project Solves

Consultation services are usually fragmented across multiple tools:

- discovery in one platform  
- booking in another  
- communication somewhere else  
- payments handled separately  

ConsultEdge solves this by combining the entire workflow into one platform:

- expert discovery & filtering  
- structured booking system  
- secure payments  
- realtime communication  
- live video consultation  
- post-session feedback & moderation  

---

## 👥 User Roles & Workflows

### 🧑 Clients
- Discover and filter experts
- Book consultations (pay now / pay later)
- Chat in realtime with experts
- Join live consultation sessions
- Track consultation history
- Submit reviews after sessions

---

### 🧑‍💼 Experts
- Apply and get verified
- Manage profile and availability
- Handle consultation sessions
- Chat with clients
- Conduct live video calls
- View and respond to reviews

---

### 🛡️ Admins
- Verify expert applications
- Manage bookings and users
- Moderate reviews
- Control industries/categories
- Monitor platform activity

---

## ⚙️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript

### State Management
- React Query (TanStack Query)
- React Form

### UI / UX
- Tailwind CSS
- ShadCN UI
- Radix UI
- Framer Motion
- Lucide Icons
- Sonner Toast

### Communication
- WebSocket (Realtime chat)
- WebRTC (Video calls)
- REST API fallback system

### Other Tools
- Axios
- Zod
- Recharts
- next-themes

---

## 🔥 Key System Highlights

### 💬 Realtime Chat System
- Instant messaging between users
- Emoji reactions
- Typing indicators
- Offline fallback polling

---

### 🎥 Live Consultation System
- WebRTC-based video calls
- Secure session handling
- Call state management (incoming / ongoing / ended)

---

### 🧠 AI Assistance Layer
- Chatbot assistant for user support
- Smart expert recommendations
- Guided user experience flow

---

### 🧑‍💼 Expert System
- Structured onboarding application
- Availability scheduling
- Consultation lifecycle tracking

---

### 🛡️ Admin System
- Expert verification pipeline
- Review moderation system
- Platform analytics & control

---

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```env
# Frontend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:5000/api/v1/auth

# Legacy support
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_AUTH_URL=http://localhost:5000/api/v1/auth

# Server-only secrets (DO NOT expose in frontend)
JWT_ACCESS_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
````

---

## 🚀 Local Development

### 1. Clone repository

```bash id="r1"
git clone https://github.com/your-username/consultedge-frontend.git
```

### 2. Install dependencies

```bash id="r2"
npm install
```

### 3. Run development server

```bash id="r3"
npm run dev
```

---

## 🏗️ Production Build

```bash id="r4"
npm run build
npm run start
```

---

## 📂 Project Structure

```text id="r5"
src/
├── app/              # Routes (public + dashboards)
├── components/      # UI components
├── hooks/           # Custom hooks
├── services/        # API services
├── lib/             # Utilities
├── providers/       # Context providers
├── types/           # TypeScript types
```

---

## 🤝 Contributing

If you want to contribute, follow these steps:

### 1. Fork the repository

Click **Fork** on GitHub

### 2. Clone your fork

```bash id="r6"
git clone https://github.com/your-username/consultedge-frontend.git
```

### 3. Create a new branch

```bash id="r7"
git checkout -b feature/your-feature
```

### 4. Install dependencies

```bash id="r8"
npm install
```

### 5. Make your changes

### 6. Commit changes

```bash id="r9"
git commit -m "feat: your feature description"
```

### 7. Push branch

```bash id="r10"
git push origin feature/your-feature
```

### 8. Create Pull Request

Open PR on GitHub

---

## 💎 Why This Project Stands Out

ConsultEdge is a complete **SaaS-level consultation ecosystem** combining:

* Marketplace discovery
* Realtime communication
* Live video infrastructure
* AI-assisted experience
* Admin governance system

---

## 👨‍💻 Author

**Mahbuba Akter**
Full-Stack Web Developer

```



