# RentCar - Quick Start Guide

## 🚀 Start the Project in 3 Steps

### Step 1: Initialize Database
```bash
python init_project.py
```

### Step 2: Start Backend (Terminal 1)
```bash
python run.py
```
Backend will run at: http://localhost:5000

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend will run at: http://localhost:3000

## 📍 Access Points

| Component | URL | Notes |
|-----------|-----|-------|
| Frontend | http://localhost:3000 | Main website |
| Admin Panel | http://localhost:3000/admin | Password: `101110` |
| API | http://localhost:5000/api | Backend endpoints |

## 🔐 Admin Credentials

- **Username**: `admin`
- **Password**: `101110`

## 📋 Admin Panel Features

### Car Management
1. **Add Car**: Click "Yangi avtomobil" button
   - Fill in car details
   - Upload image from gallery
   - Images auto-compress

2. **Delete Car**: Click "O'chirish" button
   - Confirm deletion

3. **Edit Car**: Coming soon

### Filters
- Search by name
- Filter by category

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt

# Test database connection
python test_db.py
```

### Frontend won't start
```bash
# Check Node version
node --version  # Should be 16+

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database connection error
1. Check `.env` file for DATABASE_URL
2. Verify PostgreSQL credentials
3. Test connection: `python test_db.py`

### API 404 errors
1. Ensure backend is running on port 5000
2. Check browser console for error details
3. Verify API base URL in `frontend/lib/api.ts`

## 📚 Documentation

- Full setup: See `SETUP_INSTRUCTIONS.md`
- API docs: See `routes/` folder
- Database schema: See `models.py`

## 🎯 Next Steps

1. ✅ Initialize database
2. ✅ Start backend and frontend
3. 📝 Add cars in admin panel
4. 🧪 Test booking functionality
5. 🚀 Deploy to production

## 💡 Tips

- Admin panel is accessed via triple-click on logo (or direct URL)
- Images are auto-compressed to 800px width
- All data is stored in PostgreSQL database
- Uploads folder stores image files

## 📞 Support

If you encounter issues:
1. Check console logs (browser DevTools)
2. Check terminal logs (backend)
3. Verify all services are running
4. Check network requests (DevTools Network tab)

---

**Happy coding! 🚗**
