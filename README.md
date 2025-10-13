# JNVTAA - JNV Trivandrum Alumni Association Website

A modern, full-featured alumni website for Jawahar Navodaya Vidyalaya Thiruvananthapuram, built with the MERN stack.

![JNVTAA](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=JNVTAA+-+Alumni+Network)

## 🌟 Features

### For Alumni

- **Profile Management** - Create and manage your alumni profile
- **Alumni Directory** - Search and connect with fellow alumni
- **Events** - Browse and RSVP to reunions and networking events
- **News & Updates** - Stay informed about alumni achievements and school updates
- **Gallery** - Share and view photos from school days and reunions
- **Job Board** - Post and apply for job opportunities
- **Donations** - Support school development through fundraising campaigns
- **Dashboard** - Personalized dashboard with your activity and connections

### For Administrators

- **User Verification** - Approve new alumni registrations
- **Content Moderation** - Manage gallery submissions and comments
- **Event Management** - Create and manage alumni events
- **Campaign Management** - Run fundraising campaigns
- **Analytics** - View statistics and insights

## 🛠️ Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting, bcryptjs

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Icons:** React Icons
- **Form Handling:** React Hook Form
- **Date Utilities:** date-fns

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "JNV Trivandrum"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Update with your MongoDB URI and JWT secrets

# Seed the database with dummy data
npm run seed

# Start the development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file (already configured)
# VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend application will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

**Default Admin Credentials:**

- Email: `admin@jnvtaa.org`
- Password: `admin123`

**Sample User Credentials:**

- Any user from seed data (check console output after seeding)
- Password for all seeded users: `password123`

## 📁 Project Structure

```
JNV Trivandrum/
├── backend/
│   ├── config/              # Database and auth configuration
│   ├── helpers/             # Utility functions
│   ├── middlewares/         # Express middlewares
│   ├── modules/             # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── batches/        # Batch management
│   │   ├── donations/      # Fundraising
│   │   ├── events/         # Events management
│   │   ├── gallery/        # Media gallery
│   │   ├── jobs/           # Job board
│   │   ├── news/           # News and updates
│   │   └── users/          # User/Alumni profiles
│   ├── seeds/              # Database seed scripts
│   ├── validators/         # Joi validation schemas
│   ├── app.js             # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # API client and endpoints
│   │   ├── components/    # Reusable components
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state stores
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   ├── index.css      # Global styles
│   │   └── main.jsx       # React entry point
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── vite.config.js      # Vite configuration
│   └── package.json
│
├── brd.txt                 # Business Requirements Document
├── PROJECT_STATUS.md       # Current implementation status
└── README.md              # This file
```

## 🗄️ Database Models

1. **User** - Alumni profiles with authentication and privacy settings
2. **Batch** - Batch/year information with reunion tracking
3. **Event** - Alumni events with RSVP system
4. **News** - Articles with likes and comments
5. **Gallery** - Photos/videos with approval workflow
6. **DonationCampaign** - Fundraising campaigns
7. **Donation** - Individual donation records
8. **Job** - Job postings with application tracking

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jnvtaa
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 Available Scripts

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with dummy data

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Key Features Implemented

### ✅ Completed

- User authentication (register, login, logout)
- Profile management with privacy controls
- Alumni directory with search and filters
- Event management with RSVP system
- News and updates with engagement features
- Gallery with approval workflow
- Donation campaigns and tracking
- Job board with application system
- Responsive design
- Role-based access control
- Comprehensive seed data

### 🚧 In Progress

- Dashboard user pages (Profile edit, My Events, etc.)
- Advanced search functionality
- Image upload integration
- Email notifications

### 📅 Planned

- Admin panel
- Messaging system
- Alumni networking features
- PWA capabilities
- Advanced analytics

## 🧪 Sample Data

The seed script creates:

- **60+ Users** (including 1 admin, 5 moderators, 54 regular users)
- **25 Batches** (2000-2024)
- **20 Events** (8 upcoming, 12 past)
- **20 News Articles**
- **100 Gallery Items**
- **5 Donation Campaigns**
- **15 Job Listings**

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- HTTP-only cookies for tokens
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation with Joi
- XSS protection
- SQL injection prevention

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Users

- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event
- `POST /api/events/:id/rsvp` - RSVP to event

_(See API documentation for complete list)_

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **JNVTAA Team** - Initial work

## 🙏 Acknowledgments

- JNV Trivandrum for the inspiration
- All alumni who contributed to the requirements
- The open-source community for the amazing tools

## 📞 Support

For support, email contact@jnvtaa.org or open an issue in the repository.

## 📊 Project Status

**Current Version:** 1.0.0 (Beta)
**Completion:** ~60%

- Backend: ~90% Complete
- Frontend: ~40% Complete

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed implementation status.

---

**Built with ❤️ for JNV Trivandrum Alumni**
