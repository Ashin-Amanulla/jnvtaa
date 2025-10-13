# JNVTAA Quick Start Guide

Get your JNVTAA alumni website up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install MongoDB (if not already installed)

**Option A: Local MongoDB**

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**

- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Use in backend/.env

### 2. Clone and Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies (takes 1-2 minutes)
npm install

# The .env file is already created, but verify it exists
# If using MongoDB Atlas, update MONGODB_URI

# Seed database with dummy data
npm run seed

# You should see output like:
# ✅ Created 25 batches
# ✅ Created 61 users
# ✅ Created 20 events
# ... etc.

# Start backend server
npm run dev

# Server should start on http://localhost:5000
# You'll see: 🚀 Server running in development mode on port 5000
```

### 3. Setup Frontend (New Terminal)

```bash
# Open a new terminal, navigate to frontend
cd frontend

# Install dependencies (takes 1-2 minutes)
npm install

# The .env file is already created

# Start frontend development server
npm run dev

# Frontend should start on http://localhost:5173
```

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

### 5. Login

**Admin Account:**

- Email: `admin@jnvtaa.org`
- Password: `admin123`

**Regular User Accounts:**

- Any email from the seed output
- Password: `password123`

**Or Create New Account:**

- Click "Join JNVTAA" button
- Fill the registration form
- Select any batch from dropdown
- Submit

## Verification

### Check Backend is Running

```bash
# In a new terminal or browser
curl http://localhost:5000/health

# Should return: {"status":"ok","message":"JNVTAA API is running"}
```

### Check Database

```bash
# Connect to MongoDB
mongosh

# Switch to database
use jnvtaa

# Check collections
show collections

# Check user count
db.users.countDocuments()
# Should return 61

# Check batches
db.batches.find().count()
# Should return 25
```

## Common Issues & Solutions

### Issue: "MongoDB connection failed"

**Solution:**

```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongodb      # Linux

# Start MongoDB if not running
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### Issue: "Port 5000 already in use"

**Solution:**

```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in backend/.env
```

### Issue: "Port 5173 already in use"

**Solution:**

```bash
# Kill process or Vite will ask if you want to use another port
# Press 'y' when prompted
```

### Issue: "Module not found" errors

**Solution:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Cannot login after seeding

**Solution:**

```bash
# Re-run the seed script
cd backend
npm run seed
```

## Next Steps

1. **Explore the Application**

   - Browse alumni directory
   - Check upcoming events
   - Read news articles
   - View gallery

2. **Test Features**

   - Register for an event
   - Update your profile
   - Browse jobs

3. **Admin Features** (login as admin)

   - Verify new users
   - Create events
   - Manage content

4. **Customize**
   - Update branding colors in `frontend/tailwind.config.js`
   - Modify content in pages
   - Add your school logo

## Development Workflow

### Making Changes

**Backend Changes:**

```bash
# Server auto-restarts with nodemon
# Just save your file, changes reflect immediately
```

**Frontend Changes:**

```bash
# Vite hot-reloads automatically
# Save file, browser updates instantly
```

### Viewing Logs

**Backend:**

```bash
# Logs appear in the terminal where you ran 'npm run dev'
# Morgan logs all HTTP requests
```

**Frontend:**

```bash
# Open browser DevTools (F12)
# Check Console for errors/logs
# Network tab for API calls
```

## Useful Commands

```bash
# Backend
npm run dev      # Start development server
npm run seed     # Reseed database
npm start        # Production server

# Frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build

# Database
mongosh                              # Connect to MongoDB
use jnvtaa                          # Switch to database
db.users.find().pretty()            # View all users
db.events.find().limit(5).pretty()  # View 5 events
```

## API Testing

Use tools like:

- **Postman** - https://www.postman.com/
- **Thunder Client** (VS Code extension)
- **cURL** (command line)

Example API calls:

```bash
# Get all events
curl http://localhost:5000/api/events

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jnvtaa.org","password":"admin123"}'
```

## Project URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

## File Locations

- **Backend code:** `backend/modules/`
- **Frontend pages:** `frontend/src/pages/`
- **API calls:** `frontend/src/api/`
- **Styles:** `frontend/src/index.css`
- **Configuration:** `backend/.env` and `frontend/.env`

## Resources

- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Express.js:** https://expressjs.com
- **MongoDB:** https://www.mongodb.com/docs
- **Mongoose:** https://mongoosejs.com

## Need Help?

1. Check `PROJECT_STATUS.md` for implementation details
2. Review `README.md` for comprehensive documentation
3. Check console for error messages
4. Open an issue in the repository

## Production Deployment

When ready to deploy:

1. **Backend:**

   - Set `NODE_ENV=production` in .env
   - Use MongoDB Atlas for database
   - Deploy to Heroku, Railway, or DigitalOcean

2. **Frontend:**
   - Run `npm run build`
   - Deploy to Vercel, Netlify, or Cloudflare Pages
   - Update `VITE_API_URL` to production backend URL

---

**Happy Coding! 🚀**

If you encounter any issues not covered here, check the main README.md or reach out for support.
