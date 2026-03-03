# Local Services Booking Platform 🛠️✨

A premium, full-stack platform for discovering, booking, and managing local services (Plumbing, Cleaning, Electrical, etc.). Built with a sleek glassmorphic design and a robust state-machine backend.

## 🚀 Live Demo
- **Live Site**: [https://local-service-booking-sigma.vercel.app/](https://local-service-booking-sigma.vercel.app/)
- **Backend API**: [https://local-service-booking-production.up.railway.app](https://local-service-booking-production.up.railway.app)

---

## ✨ Features

### 🔍 Discovery & Search
- **Smart Filter**: Search by service name or filter by category (Cleaning, Plumbing, etc.).
- **Provider Profiles**: View detailed service descriptions, ratings, and pricing.

### 📅 Seamless Booking Flow
- **Glassmorphic Checkout**: A premium multi-step flow for scheduling services.
- **Media Uploads**: Attach photos of the problem area during booking.
- **Real-time State Machine**: Backend logic that prevents invalid transitions and manages the job lifecycle.

### 💼 Provider Workspace
- **Job Management**: Providers can accept leads, update status to "In Progress", and confirm completion.
- **Verification**: Submit "After" photos to verify completed work.

### 🛡️ Admin Moderation
- **Review Review**: Admin panel to moderate customer reviews before they go live.
- **System Health**: Overview of platform activity.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Framer Motion, Lucide Icons, Vanilla CSS (Glassmorphism).
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: SQLite (Production uses persistent volumes).
- **Deployment**: Vercel (Frontend) & Railway (Backend).

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/AnsumanSutar/local-service-booking.git
cd local-service-booking
```

### 2. Setup Backend
```bash
cd server
npm install
npx prisma generate
node index.js
```
*Server will run on `http://localhost:3001`*

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```
*App will run on `http://localhost:5173`*

---

## 🐋 Docker Support
Run the entire stack with one command:
```bash
docker-compose up --build
```

---

## 📝 License
MIT
