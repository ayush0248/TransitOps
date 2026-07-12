# 🚛 TransitOps - Smart Transport Operations Platform

![TransitOps Banner](https://img.shields.io/badge/TransitOps-Transport_OS-f59e0b?style=for-the-badge&logo=next.js&logoColor=black)

**TransitOps** is a comprehensive, end-to-end transport operations platform built to digitize and automate vehicle, driver, dispatch, maintenance, and expense management. Designed specifically to replace outdated spreadsheets and manual logbooks, TransitOps enforces strict business rules, eliminates scheduling conflicts, tracks maintenance lifecycles, and provides deep operational insights through role-based access control (RBAC).

---

## 📖 Table of Contents
1. [Business Context & Objective](#-business-context--objective)
2. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
3. [Core Features & Modules](#-core-features--modules)
4. [Strict Business Rules Enforced](#-strict-business-rules-enforced)
5. [Bonus Features Implemented](#-bonus-features-implemented)
6. [Tech Stack](#-tech-stack)
7. [Getting Started (Local Development)](#-getting-started-local-development)

---

## 🎯 Business Context & Objective
Many logistics companies still rely on disparate tools to manage transport operations, leading to underutilized vehicles, missed maintenance, expired driver licenses, and poor operational visibility. 

**Objective:** Build a centralized platform that seamlessly manages the complete lifecycle of transport operations—from vehicle acquisition and driver compliance to active dispatching, maintenance logging, and financial analytics.

---

## 🔐 Role-Based Access Control (RBAC)
TransitOps implements secure email/password authentication using JWTs and features strict route and API protection based on four distinct user personas:

| Role | Responsibilities & Access |
| :--- | :--- |
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, and overall operational efficiency. Has highest system access. |
| **Driver / Dispatcher** | Creates trips, assigns vehicles and drivers, and monitors active deliveries. |
| **Safety Officer** | Ensures driver compliance, tracks license validity, manages suspensions, and monitors safety scores. |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, generates reports, and calculates ROI. |

---

## 🚀 Core Features & Modules

### 📊 1. Command Dashboard
- Displays real-time KPIs: *Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, and Fleet Utilization (%).*
- Dynamic global filtering by **Vehicle Type**, **Status**, and **Region**.

### 🚙 2. Vehicle Registry
- Master list of fleet assets tracking Registration Number, Model, Type, Max Load Capacity (kg), Odometer, Acquisition Cost, and Status.
- **Dynamic Statuses:** `Available`, `On Trip`, `In Shop`, `Retired`.

### 👨‍✈️ 3. Driver Compliance & Management
- Driver profiles tracking License Category, Expiry Date, Contact Info, and Safety Score (0-100).
- **Dynamic Statuses:** `Available`, `On Trip`, `Off Duty`, `Suspended`.

### 🛣️ 4. Trip Dispatching & State Machine
- Complex trip creation requiring Source, Destination, Vehicle, Driver, Cargo Weight, and Distance.
- **Trip Lifecycle:** `Draft` ➔ `Dispatched` ➔ `Completed` ➔ `Cancelled`.

### 🔧 5. Maintenance Shop
- Comprehensive maintenance logging for vehicles.
- Creating an active maintenance ticket automatically locks the vehicle in the `In Shop` status.

### ⛽ 6. Fuel & Expense Tracking
- Granular tracking of fuel consumption (liters, cost per liter) and external expenses (tolls, insurance, repairs).
- Automatically computes the Total Operational Cost per vehicle.

### 📈 7. ROI Reports & Financial Analytics
- Auto-calculates metrics like Fuel Efficiency, Operational Cost, and **Vehicle ROI** `[Revenue - (Maintenance + Fuel) / Acquisition Cost]`.
- Features single-click **CSV Exports**.

---

## 🛑 Strict Business Rules Enforced
TransitOps is built with a bulletproof backend state machine that guarantees data integrity:
1. **Unique Identification:** Vehicle Registration Numbers and Driver License Numbers are strictly unique.
2. **Dispatch Locks:** `Retired` or `In Shop` vehicles can **never** appear in the dispatch selection pool.
3. **Compliance Locks:** Drivers with expired licenses or `Suspended` status are automatically blocked from trip assignments.
4. **Atomic Trip States:** A driver or vehicle already marked `On Trip` cannot be double-booked for another trip.
5. **Payload Validation:** Cargo Weight entered during dispatch **must not exceed** the selected vehicle's Maximum Load Capacity.
6. **Auto-Transitions:** 
   - Dispatching a trip instantly changes both the Vehicle and Driver status to `On Trip`.
   - Completing a trip updates the odometer, logs fuel, and restores entities to `Available`.
   - Cancelling a trip aborts the dispatch and restores entities to `Available`.
7. **Maintenance Locks:** Opening an active maintenance record forces the vehicle status to `In Shop`. Closing the ticket restores it to `Available`.

---

## ✨ Bonus Features Implemented
Beyond the mandatory requirements, this project includes the following advanced capabilities:
- ✅ **PDF Export Generation:** Financial Analysts can download highly detailed, stylized PDF Audit Reports generated dynamically on the client side using `jsPDF`.
- ✅ **Automated Email Reminders:** Includes a Cron-ready API endpoint (`/api/cron/check-licenses`) integrated with **Nodemailer**. Automatically scans for expiring driver licenses and dispatches HTML warning emails to both the Driver and the Safety Officer.
- ✅ **Dark Mode / Glassmorphism UI:** A stunning, premium aesthetic featuring dark themes, mesh gradients, and smooth micro-animations.
- ✅ **Advanced Data Tables:** Includes universal search, filtering, and sorting capabilities across all modules.
- ✅ **Responsive Web Interface:** Flawless mobile optimization with a collapsable mobile sidebar and responsive data grids.
- ✅ **Data Visualization:** Built-in dynamic charts and KPI gauge visualizations.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS Modules
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **State Management:** TanStack React Query
- **UI Components:** Radix UI / Custom Glassmorphism Components
- **Icons:** Lucide React
- **PDF Generation:** jsPDF + jspdf-autotable
- **Email Delivery:** Nodemailer (Ethereal for testing)
- **Forms & Validation:** React Hook Form + Zod

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/soham04010/TransitOps.git
   cd transitops
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/transitops"
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Optional: Real SMTP Configuration for Emails (Defaults to Ethereal Mock if omitted)
   # SMTP_HOST="smtp.gmail.com"
   # SMTP_PORT=587
   # SMTP_USER="your-email@gmail.com"
   # SMTP_PASS="your-app-password"
   ```

4. **Initialize the Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---
*Built with ❤️ for the Hackathon.*

