# Getting Started with JNVTAA Website

Welcome! This guide will help you get the JNVTAA alumni website running on your local machine in just a few minutes.

## 🎯 What You'll Have

After following this guide, you'll have:

- ✅ Fully functional alumni website
- ✅ Backend API with 8 modules
- ✅ 18 beautiful, animated pages
- ✅ 60+ dummy alumni profiles
- ✅ 25 batches, 20 events, 20 news articles
- ✅ Complete authentication system
- ✅ Admin panel
- ✅ PWA capabilities

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check

```bash
# Check Node.js (need v16+)
node --version

# Check npm
npm --version

# Check if MongoDB is installed
mongod --version
```

If anything is missing, see the "Installation" section below.

### Start the Website

**Terminal 1 - Backend:**

```bash
cd backend
npm install          # Install dependencies (1-2 min)
npm run seed        # Create dummy data (30 sec)
npm run dev         # Start server
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install          # Install dependencies (1-2 min)
npm run dev         # Start app
```

**Open Browser:**

```
http://localhost:5173
```

**Login:**

- Email: `admin@jnvtaa.org`
- Password: `admin123`

Done! 🎉

## 📦 Installation (If Prerequisites Missing)

### Install Node.js

**Windows:**

- Download from https://nodejs.org
- Install LTS version
- Restart terminal

**macOS:**

```bash
brew install node
```

**Linux:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install MongoDB

**Windows:**

- Download from https://www.mongodb.com/try/download/community
- Run installer
- MongoDB will start automatically

**macOS:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Or Use MongoDB Atlas (Cloud - Free):**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (takes 5 min)
4. Get connection string
5. Update `backend/.env` with connection string

## 📚 Exploring the Website

### As a Regular User

1. **Register** - Click "Join JNVTAA"

   - Fill in your details
   - Select your batch
   - Create account

2. **Browse Directory** - See all alumni

   - Search by name
   - Filter by batch, location, profession
   - View batch-specific pages

3. **View Events** - Check upcoming events

   - Browse all events
   - See event details
   - RSVP to events

4. **Read News** - Stay updated

   - Browse articles
   - Read full stories
   - Like and comment

5. **View Gallery** - Browse photos

   - Click on images for lightbox
   - Filter by category
   - View memories

6. **Donate** - Support JNV

   - View active campaigns
   - See progress bars
   - Donate to causes

7. **Browse Jobs** - Career opportunities

   - Filter by type and level
   - View job details
   - Apply to jobs

8. **Your Dashboard** - Personal space
   - View profile stats
   - Complete your profile
   - See suggested actions

### As an Admin

1. **Login as Admin**

   - Email: `admin@jnvtaa.org`
   - Password: `admin123`

2. **Access Admin Panel** - Click "Admin" in navbar

   - View statistics
   - See pending verifications
   - Access management tools

3. **Verify Users**

   - Review new registrations
   - Approve alumni accounts

4. **Manage Content**
   - Create events
   - Publish news articles
   - Approve gallery items
   - Manage campaigns

## 🎨 Customization

### Change Colors

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    600: '#your-color', // Change primary color
  }
}
```

### Add Your School Logo

Replace logo in:

- `frontend/src/layout/Navbar.jsx`
- `frontend/public/` (add logo files)

### Update Content

Edit the following files for custom content:

- **Home page**: `frontend/src/pages/Home.jsx`
- **About page**: `frontend/src/pages/About.jsx`
- **Footer**: `frontend/src/layout/Footer.jsx`
- **Contact info**: `frontend/src/pages/Contact.jsx`

### Add More Dummy Data

Edit `backend/seeds/index.js` and run:

```bash
npm run seed
```

## 🔧 Common Tasks

### Add a New User Manually

Use MongoDB Shell:

```bash
mongosh
use jnvtaa
db.users.insertOne({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "$2a$10$...", // Use hashed password
  batch: ObjectId("..."), // Get from batches collection
  isVerified: true
})
```

### Create an Event

1. Login as admin
2. Go to `/admin`
3. Click "Events Management"
4. Fill in event details
5. Publish

### Reset Database

```bash
cd backend
npm run seed
```

This will clear and repopulate all data.

### View API Documentation

All API endpoints are documented in:

- `README.md` - Overview
- Check individual controller files for details

### Check Logs

**Backend:**

- Logs appear in terminal where you ran `npm run dev`

**Frontend:**

- Open browser DevTools (F12)
- Check Console tab

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"

**Solution:**

```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongodb      # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### "Port already in use"

**Solution:**

```bash
# Find and kill process
lsof -i :5000   # Backend port
lsof -i :5173   # Frontend port

# Or change port in .env files
```

### "Module not found" errors

**Solution:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Cannot find module '@/...'"

**Solution:**

- Make sure you're in the frontend directory
- Path alias `@/` is configured in `vite.config.js`
- Restart dev server

## 📱 Testing on Mobile

### Option 1: Same Network

1. Find your computer's IP address:

   ```bash
   ipconfig           # Windows
   ifconfig           # macOS/Linux
   ```

2. Update frontend `.env`:

   ```env
   VITE_API_URL=http://YOUR_IP:5000/api
   ```

3. On mobile browser, go to:
   ```
   http://YOUR_IP:5173
   ```

### Option 2: ngrok (Easier)

```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 5000

# Expose frontend
ngrok http 5173

# Use ngrok URLs on mobile
```

## 🚀 Next Steps

1. **Customize** - Add your school's branding and content
2. **Test** - Try all features thoroughly
3. **Deploy** - See DEPLOYMENT.md for production deployment
4. **Launch** - Announce to your alumni community!

## 📖 Further Reading

- **README.md** - Complete project documentation
- **QUICKSTART.md** - Quick setup guide
- **PROJECT_STATUS.md** - Implementation status
- **FEATURES.md** - Complete features list (200+)
- **DEPLOYMENT.md** - Production deployment guide

## 💡 Pro Tips

1. **Use dummy data to demo** - Show stakeholders before going live
2. **Test on multiple devices** - Mobile, tablet, desktop
3. **Customize gradually** - Start with colors and logo
4. **Gather feedback** - From alumni before launch
5. **Plan launch event** - Make it special!

## 🆘 Need Help?

1. Check the documentation files listed above
2. Review error messages in console/terminal
3. Search for error online
4. Check MongoDB connection first (most common issue)
5. Verify all dependencies installed correctly

## 🎓 Learning Resources

- **React**: https://react.dev/learn
- **Tailwind CSS**: https://tailwindcss.com/docs
- **MongoDB**: https://www.mongodb.com/docs
- **Express.js**: https://expressjs.com/guide

---

**Happy Building! 🎉**

The JNVTAA platform is ready to bring your alumni community together!
