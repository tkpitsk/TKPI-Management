# TKPI Management

TKPI Management is a **full-stack HR & Operations Management System** built with **Next.js 15**, **Node.js**, **MongoDB**, and **Tailwind CSS**. It provides comprehensive tools for employee management, attendance tracking, advance payments, reminders, and operational workflows tailored for small to medium businesses.

## ✨ Features

### **Employee Management**
- Complete employee CRUD operations
- Role-based access (Admin, Manager, Employee)
- Profile management with authentication

### **Attendance & Payroll**
- Daily/monthly attendance marking
- Status tracking: Present, Absent, Half-day
- Advance payment recording
- Monthly attendance summaries
- Employee self-service attendance view

### **Reminders & Notifications**
- Date-based reminder system
- Expiry date tracking
- Calendar integration with visual status indicators
- Admin/Manager reminder management

### **Admin Dashboard**
- Employee attendance register
- Bulk attendance marking
- Advance payment history
- Role-based permissions

## 🛠 Tech Stack

```
Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS + React Hook Form
Backend: Node.js + Express + Mongoose + MongoDB
Authentication: JWT + Role-based middleware
UI Components: shadcn/ui + Lucide React icons
Styling: Tailwind CSS + Headless UI
Database: MongoDB (via Mongoose)
Deployment: Vercel (Frontend) + Railway/Render (Backend)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/tkpitsk/TKPI-Management.git
cd TKPI-Management
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

### 4. Environment Variables

**Backend `.env`**:
```env
MONGO_URI=mongodb://localhost:27017/tkpi
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

**Frontend `.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
TKPI-Management/
├── backend/
│   ├── controllers/     # API logic
│   ├── models/         # Mongoose schemas
│   ├── middleware/     # Auth & role middleware
│   ├── routes/         # API routes
│   └── app.js          # Express server
├── frontend/
│   ├── app/            # Next.js App Router
│   ├── components/     # Reusable UI components
│   ├── lib/            # API client & utils
│   └── types/          # TypeScript definitions
└── README.md
```

## 🔐 Authentication & Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features |
| **Manager** | Attendance marking, advance giving, reminders |
| **Employee** | View own attendance/advances |

## 📱 Pages & Features

### Admin/Manager Dashboard
```
├── /dashboard/employees      # Employee CRUD
├── /dashboard/attendance     # Mark attendance + advances
├── /dashboard/reminders      # Reminder management
└── /dashboard/attendance/me  # Personal attendance
```

### Key Components
- `AttendanceTable` - Monthly attendance register
- `ReminderDayCell` - Calendar cells with reminders
- `EmployeeSelector` - Dropdown with search
- `StatusBadge` - Present/Absent/Half-day indicators

## 🧪 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/attendance` | Mark attendance + advance | Admin/Manager |
| `GET` | `/api/attendance` | Get employee attendance | Admin/Manager |
| `GET` | `/api/attendance/me` | Get my attendance | Employee |
| `POST` | `/api/advance` | Record advance payment | Admin/Manager |
| `GET` | `/api/advance/me` | Get my advances | Employee |

## 🎨 Design System

- **Tailwind CSS** with custom design tokens
- **Nexus color palette** (warm neutrals + teal accent)
- **shadcn/ui** components
- **Responsive design** (mobile-first)
- **Dark mode** support
- **Accessibility** (WCAG AA compliant)

## 🚀 Deployment

### Vercel (Frontend)
1. Connect GitHub repo
2. Set `NEXT_PUBLIC_API_URL`
3. Deploy

### Railway/Render (Backend)
1. Connect GitHub repo
2. Add MongoDB service
3. Set environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Lucide React** - Clean icon set
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js** - React framework for production

## 📞 Support

For support or questions, create an issue or reach out via GitHub Discussions.

***

<div align="center">
  <img src="https://img.shields.io/badge/built%20with-%E2%9D%A4%EF%B8%8F-yellow.svg" alt="built with love">
</div>

*Made with ❤️ for small business operations*
