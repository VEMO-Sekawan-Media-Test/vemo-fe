# VEMO - Vehicle Monitoring System (Frontend)

A comprehensive vehicle monitoring and booking system for mining companies, built with Next.js.

## Features

- **Dashboard**: Overview with charts showing vehicle usage, bookings, and fuel consumption
- **Vehicle Management**: Add, edit, and manage company vehicles
- **Booking System**: Create and track vehicle booking requests
- **Approval Workflow**: Multi-level approval (2 levels) for booking requests
- **Maintenance Tracking**: Schedule and track vehicle maintenance
- **Reports**: Generate reports with Excel export functionality
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Excel Export**: xlsx
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd vemo-fe
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create environment file:
   ```bash
   cp .env.example .env.local
   ```
5. Update the API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
6. Run the development server:
   ```bash
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| approver1 | approver123 | Approver Level 1 |
| approver2 | approver123 | Approver Level 2 |

## Project Structure

```
vemo-fe/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard page
│   │   ├── bookings/         # Booking management
│   │   ├── vehicles/         # Vehicle management
│   │   ├── approvals/        # Approval workflow
│   │   ├── maintenance/      # Maintenance tracking
│   │   ├── reports/          # Reports & exports
│   │   └── login/            # Login page
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── auth/            # Auth components
│   ├── context/             # React Context providers
│   ├── lib/                 # API client and utilities
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── ...config files
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3001`. Make sure the backend server is running before using the frontend.

### API Endpoints Used

- `POST /auth/login` - User authentication
- `GET /vehicles` - Get all vehicles
- `POST /vehicles` - Create vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle
- `GET /bookings` - Get all bookings
- `POST /bookings` - Create booking
- `POST /bookings/:id/approve` - Approve booking
- `POST /bookings/:id/reject` - Reject booking
- `GET /bookings/pending-approvals` - Get pending approvals
- `GET /maintenance` - Get all maintenance records
- `POST /maintenance` - Create maintenance record
- `GET /reports/dashboard` - Get dashboard statistics
- `GET /reports/bookings/export` - Export bookings to Excel

## Usage Guide

### Login
1. Open the application
2. Enter your username and password
3. Click "Sign In"

### Dashboard
The dashboard displays:
- Total vehicles count
- Active bookings count
- Pending approvals count
- Total fuel used
- Monthly bookings trend chart
- Vehicles by location chart
- Bookings by vehicle type chart
- Recent bookings table

### Vehicle Management (Admin Only)
1. Navigate to "Vehicles" from the sidebar
2. Click "Add Vehicle" to create a new vehicle
3. Fill in the vehicle details (model, plate number, type, ownership, location, fuel consumption)
4. Click "Create" to save

### Booking Management
1. Navigate to "Bookings" from the sidebar
2. Click "New Booking" to create a booking
3. Select a vehicle, enter driver name, choose approvers, and set dates
4. The booking will be pending approval

### Approval Workflow
1. Navigate to "Approvals" from the sidebar
2. View pending approval requests
3. Click "Details" to see booking information
4. Click "Approve" or "Reject" to process the request
5. Two-level approval is required for final approval

### Maintenance Tracking
1. Navigate to "Maintenance" from the sidebar
2. Click "Schedule Maintenance" to create a new maintenance record
3. Fill in the details (vehicle, description, date, estimated cost, service type)
4. Update status as needed (Scheduled → In Progress → Completed)

### Reports & Export
1. Navigate to "Reports" from the sidebar
2. View analytics and charts
3. Filter by date range
4. Click "Export All" to download all bookings
5. Click "Export Range" to export filtered data

## Physical Data Model

The system uses the following main entities:

```
User (id, username, password, name, role)
  ├── bookingsAsAdmin (creator)
  ├── bookingsAsAppr1 (level 1 approver)
  └── bookingsAsAppr2 (level 2 approver)

Vehicle (id, modelName, plateNumber, type, ownership, location, fuelConsumption, lastService, currentFuel)
  ├── Bookings
  └── Maintenance

Booking (id, vehicleId, driverName, creatorId, approver1Id, approver2Id, status, startDate, endDate, fuelStart, fuelEnd, distanceKm, fuelUsed)
  └── Vehicle (many-to-one)
  └── User (multiple relations)

Maintenance (id, vehicleId, description, scheduledDate, completedDate, status, estimatedCost, actualCost, serviceType, notes)
  └── Vehicle (many-to-one)
```

## Activity Diagram - Booking Process

```
┌─────────────┐
│   Employee  │
└──────┬──────┘
       │
       │ Create booking request
       ▼
┌─────────────┐
│    Admin    │◄─────────────┐
└──────┬──────┘              │
       │ Create booking       │
       │ Assign approvers    │
       ▼                     │
┌─────────────┐              │
│   Pending   │              │
│   (Status: 0)              │
└──────┬──────┘              │
       │                     │
       │ Submit for approval │
       ▼                     │
┌─────────────┐              │
│ Approver 1  │              │
│ (Level 1)   │              │
└──────┬──────┘              │
       │                     │
       │ Review & Decide     │
       ├─────────────────────┤
       │                     │
       │ Approve             │ Reject
       ▼                     ▼
┌─────────────┐        ┌─────────────┐
│  Lvl 1 App  │        │   Rejected │
│  (Status: 1)│        │  (Status: -1)
└──────┬──────┘        └─────────────┘
       │
       │ Submit for final approval
       ▼
┌─────────────┐
│ Approver 2  │
│ (Level 2)   │
└──────┬──────┘
       │
       │ Review & Decide
       ├─────────────────────┐
       │                     │
       │ Approve             │ Reject
       ▼                     ▼
┌─────────────┐        ┌─────────────┐
│   Approved  │        │   Rejected │
│  (Status: 2)│        │  (Status: -1)
└──────┬──────┘        └─────────────┘
       │
       │ Vehicle usage
       ▼
┌─────────────┐
│  Complete   │──► Fuel tracking & distance
│   Booking   │    recorded
└─────────────┘
```

## License

This project is proprietary software.

## Support

For support, please contact the development team.
