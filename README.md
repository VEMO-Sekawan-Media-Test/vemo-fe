<h1 align="center">VEMO - Vehicle Monitoring System</h1>

<div align="center">

![VEMO Logo](https://raw.githubusercontent.com/your-repo/vemo/main/vemo-fe/public/images/vemo_ic.png)

**Sistem monitoring dan pemesanan kendaraan perusahaan penambangan nikel**  
dengan fitur dashboard, approval multi-level, dan laporan.

🌐 **Frontend**: [https://vemo-console.vercel.app/](https://vemo-console.vercel.app/)
🎯 **Backend API**: [https://vemo-be-production.up.railway.app/](https://vemo-be-production.up.railway.app/)

</div>

---

## 📋 Table of Contents

1. [🎯 Overview](#-overview)
2. [✨ Features](#-features)
3. [🛠️ Tech Stack](#️-tech-stack)
4. [📁 Project Structure](#-project-structure)
5. [🚀 Getting Started](#-getting-started)
6. [🔐 Demo Credentials](#-demo-credentials)
7. [📚 API Integration](#-api-integration)
8. [📖 Usage Guide](#-usage-guide)
9. [🏗️ Component Architecture](#️-component-architecture)

---

## 🎯 Overview

VEMO Frontend adalah aplikasi web responsif untuk mengelola:
- 🚗 **Kendaraan** - CRUD kendaraan company dan rental
- 📅 **Pemesanan** - Booking kendaraan dengan approval 2 level
- ✅ **Persetujuan** - Multi-level approval workflow
- 🔧 **Pemeliharaan** - Jadwal service & tracking
- 📈 **Laporan** - Dashboard analytics & export Excel

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Charts untuk vehicle usage, bookings, fuel consumption |
| 🚗 **Vehicle Management** | Add, edit, delete kendaraan company/rental |
| 📅 **Booking System** | Create & track booking requests |
| ✅ **Approval Workflow** | 2-level approval (Manager & Direktur) |
| 🔧 **Maintenance** | Schedule & track pemeliharaan |
| 📈 **Reports** | Analytics charts & Excel export |
| 📱 **Responsive** | Support desktop & mobile |
| 🎨 **Modern UI** | Tailwind CSS + smooth animations |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| ⚛️ **Next.js 15** | React framework with App Router |
| 🔷 **TypeScript** | Type-safe development |
| 🎨 **Tailwind CSS** | Utility-first styling |
| 📊 **Chart.js** | Data visualization |
| 📡 **Axios** | HTTP client for API |
| 📅 **date-fns** | Date manipulation |
| 📊 **xlsx** | Excel export |
| 🖼️ **Lucide React** | Icon library |
| 🔐 **JWT** | Authentication |

---

## 📁 Project Structure

```
vemo-fe/
├── public/                      # Static assets
│   └── images/                  # Images & logos
│       ├── vemo_ic.png          # App logo
│       ├── avatar.svg           # Default avatar
│       ├── bglogin1.png         # Login background
│       └── bglogin2.png         # Login slideshow
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── login/              # 🔐 Login page
│   │   │   └── page.tsx        # Login with slideshow
│   │   ├── dashboard/          # 📊 Dashboard
│   │   │   └── page.tsx       # Stats & charts
│   │   ├── vehicles/           # 🚗 Vehicle management
│   │   │   └── page.tsx       # CRUD vehicles
│   │   ├── bookings/           # 📅 Booking management
│   │   │   └── page.tsx       # Create & view bookings
│   │   ├── approvals/          # ✅ Approval workflow
│   │   │   └── page.tsx       # Approve/reject bookings
│   │   ├── maintenance/        # 🔧 Maintenance tracking
│   │   │   └── page.tsx       # Schedule maintenance
│   │   ├── reports/            # 📈 Reports & export
│   │   │   └── page.tsx       # Analytics & Excel
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home redirect
│   │   └── globals.css        # Global styles
│   │
│   ├── components/             # React components
│   │   ├── ui/               # 📦 Reusable UI
│   │   │   ├── Button.tsx    # Button component
│   │   │   ├── Input.tsx     # Input/Select
│   │   │   ├── Card.tsx      # Card wrapper
│   │   │   ├── Modal.tsx      # Modal dialog
│   │   │   ├── Badge.tsx     # Status badges
│   │   │   ├── Toast.tsx     # Toast notifications
│   │   │   └── ...           # More UI components
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   │   └── Navbar.tsx    # Top navigation
│   │   │
│   │   ├── charts/           # 📊 Chart components
│   │   │   ├── LineChart.tsx
│   │   │   └── DoughnutChart.tsx
│   │   │
│   │   └── auth/             # 🔐 Auth components
│   │       └── AuthGuard.tsx
│   │
│   ├── context/              # 🔄 React Context
│   │   ├── AuthContext.tsx   # Auth state management
│   │   └── SidebarContext.tsx # Sidebar state
│   │
│   ├── lib/                   # 📁 Utilities
│   │   └── api.ts            # Axios API client
│   │
│   ├── constants/             # 📝 Constants
│   │   ├── index.ts          # Barrel export
│   │   ├── login.ts          # Login constants
│   │   ├── vehicles.ts       # Vehicle constants
│   │   ├── bookings.ts       # Booking constants
│   │   ├── maintenance.ts    # Maintenance constants
│   │   └── reports.ts        # Reports constants
│   │
│   └── types/                # 🔷 TypeScript types
│       └── index.ts          # Type definitions
│
├── middleware.ts             # Next.js middleware (auth)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| 🟢 Node.js | 18+ |
| 📦 npm/yarn | Latest |

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-repo/vemo.git
cd vemo/vemo-fe

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" >> .env.local

# 5. For production (Vercel)
echo "NEXT_PUBLIC_API_URL=https://vemo-be-production.up.railway.app" >> .env.local

# 6. Start development server
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 🔐 Demo Credentials

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin_vemo` | `password123` | 👑 ADMIN | Full system access |
| `manager_1` | `password123` | 👤 APPROVER | Level 1 approval |
| `director_2` | `password123` | 👤 APPROVER | Level 2 approval |

---

## 📚 API Integration

### Base URL

| Environment | URL |
|------------|-----|
| 🏠 Local | `http://localhost:3001` |
| 🚂 Production | `https://vemo-be-production.up.railway.app` |

## 📖 Usage Guide

### 🔐 Login
1. Open VEMO at [https://vemo-console.vercel.app/](https://vemo-console.vercel.app/)
2. Select role (Admin/Approver)
3. Enter credentials
4. Click "Sign In"

### 📊 Dashboard
The dashboard displays:
- 📈 Total vehicles & active bookings
- ⏳ Pending approvals count
- ⛽ Total fuel consumption
- 📉 Monthly bookings trend chart
- 🚗 Vehicles by location chart
- 📋 Recent bookings table

### 🚗 Vehicle Management (Admin Only)
1. Navigate to "Kendaraan"
2. Click "Jadwal Baru" to add vehicle
3. Fill form (model, plate, type, ownership, location)
4. Click "Create"

### 📅 Booking
1. Navigate to "Pemesanan"
2. Click "Pemesanan Baru"
3. Select vehicle, driver, approvers, dates
4. Submit - status will be "Menunggu Persetujuan"

### ✅ Approval Workflow
1. Navigate to "Persetujuan"
2. View pending requests
3. Click "Details" for info
4. Click "Setuju" (Approve) or "Tolak" (Reject)
5. Two approvals needed for final approval

### 🔧 Maintenance (Admin Only)
1. Navigate to "Pemeliharaan"
2. Click "Jadwal Baru" to schedule maintenance
3. Status chips are clickable for Admin to update:
   - 🟡 Dijadwalkan → 🔵 Sedang Berlangsung → 🟢 Selesai

### 📈 Reports
1. Navigate to "Laporan"
2. View analytics charts
3. Filter by date range
4. Click "Export" to download Excel

</div>
