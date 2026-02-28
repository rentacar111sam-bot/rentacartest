# RentCar Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Errors

#### Error: `psycopg2.OperationalError: could not connect to server`

**Cause**: PostgreSQL connection failed

**Solutions**:
```bash
# Test database connection
python test_db.py

# Check .env file
cat .env | grep DATABASE_URL

# Verify credentials
# Host: db.wplcddsoxvhdxlrmmkmb.supabase.co
# Port: 5432
# Database: postgres
# Username: postgres
# Password: 10203010Arent_@
```

#### Error: `FATAL: password authentication failed`

**Cause**: Wrong password in DATABASE_URL

**Solution**: Update `.env` file:
```
DATABASE_URL=postgresql://postgres:10203010Arent_%40@db.wplcddsoxvhdxlrmmkmb.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
```

Note: `%40` is URL-encoded `@` symbol

### 2. API Errors (404, 500)

#### Error: `GET /api/cars 404 Not Found`

**Cause**: Backend not running or route not registered

**Solutions**:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Restart backend
python run.py

# Check routes are registered in app.py
grep "register_blueprint" app.py
```

#### Error: `GET /api/cars 500 Internal Server Error`

**Cause**: Database query error

**Solutions**:
```bash
# Check backend logs for error details
# Look for traceback in terminal

# Test database connection
python test_db.py

# Verify Car model
python -c "from models import Car; print(Car.__tablename__)"
```

### 3. Frontend Issues

#### Error: `Cannot GET /admin`

**Cause**: Frontend routing issue

**Solution**: 
- Admin panel is at `/admin` route
- Make sure frontend is running: `npm run dev`
- Check `frontend/app/admin/page.tsx` exists

#### Error: `Failed to load resource: net::ERR_NAME_NOT_RESOLVED`

**Cause**: API URL not resolving

**Solutions**:
```bash
# Check API base URL in frontend/lib/api.ts
grep "API_BASE_URL" frontend/lib/api.ts

# Should be: http://localhost:5000/api

# Verify backend is running
curl http://localhost:5000/api/health
```

#### Error: `TypeError: react_hot_toast__WEBPACK_IMPORTED_MODULE_5__.default.info is not a function`

**Cause**: Using `toast.info()` instead of `toast.success()` or `toast.error()`

**Solution**: Replace in code:
```typescript
// Wrong
toast.info('message')

// Correct
toast.success('message')
toast.error('message')
toast.loading('message')
```

### 4. Image Upload Issues

#### Error: `413 Payload Too Large`

**Cause**: File size exceeds MAX_CONTENT_LENGTH

**Solution**: Update `.env`:
```
MAX_CONTENT_LENGTH=5242880  # 5MB
```

Or increase the limit:
```
MAX_CONTENT_LENGTH=10485760  # 10MB
```

#### Error: `Failed to upload image`

**Cause**: Upload endpoint error

**Solutions**:
```bash
# Check uploads folder exists
ls -la uploads/

# Create if missing
mkdir -p uploads

# Check file permissions
chmod 755 uploads

# Test upload endpoint
curl -X POST http://localhost:5000/api/upload \
  -F "file=@test.jpg"
```

### 5. Admin Panel Issues

#### Error: `Admin panel shows login page after login`

**Cause**: localStorage not persisting

**Solutions**:
```javascript
// Check localStorage
localStorage.getItem('adminAuth')

// Clear and try again
localStorage.clear()

// Check browser console for errors
```

#### Error: `Wrong password message`

**Cause**: Password mismatch

**Solution**: 
- Default password: `101110`
- Check `.env` file: `ADMIN_PASSWORD=101110`
- Clear browser cache and try again

#### Error: `Cannot add car - form not submitting`

**Cause**: Form validation error

**Solutions**:
1. Check all required fields are filled
2. Check browser console for JavaScript errors
3. Verify image is selected
4. Check backend logs for API error

### 6. Build Issues

#### Error: `npm ERR! code ENOENT`

**Cause**: node_modules not installed

**Solution**:
```bash
cd frontend
npm install
npm run dev
```

#### Error: `TypeScript compilation error`

**Cause**: Type mismatch

**Solution**:
```bash
# Check diagnostics
npm run build

# Fix type errors in code
# Example: category must be 'byudjetillar' | 'komfortli' | 'premiumlar' | 'krossoverlar'
```

### 7. Port Already in Use

#### Error: `Address already in use :5000`

**Cause**: Another process using port 5000

**Solutions**:
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=5001 python run.py
```

#### Error: `Address already in use :3000`

**Cause**: Another process using port 3000

**Solution**:
```bash
# Kill process or use different port
PORT=3001 npm run dev
```

### 8. Database Initialization

#### Error: `Table 'cars' doesn't exist`

**Cause**: Database not initialized

**Solution**:
```bash
# Initialize database
python init_project.py

# Or manually
python -c "from app import app, init_db; init_db()"
```

#### Error: `Duplicate key value violates unique constraint`

**Cause**: Trying to insert duplicate data

**Solution**:
```bash
# Clear database and reinitialize
# WARNING: This deletes all data!
python -c "from app import app, db; db.drop_all(); db.create_all()"
python init_project.py
```

### 9. Environment Variables

#### Error: `KeyError: 'DATABASE_URL'`

**Cause**: .env file not loaded

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Verify it's in project root
pwd

# Reload environment
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('DATABASE_URL'))"
```

### 10. CORS Issues

#### Error: `Access to XMLHttpRequest blocked by CORS policy`

**Cause**: CORS not configured

**Solution**: Already configured in `app.py`:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        ...
    }
})
```

If still having issues:
1. Check backend is running
2. Verify frontend URL matches CORS origins
3. Check browser console for specific error

## Debug Mode

### Enable Verbose Logging

**Backend**:
```python
# In app.py
app.run(debug=True)  # Already enabled in development
```

**Frontend**:
```bash
# Check browser DevTools
# Console tab for JavaScript errors
# Network tab for API calls
```

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get cars
curl http://localhost:5000/api/cars

# Get specific car
curl "http://localhost:5000/api/cars?id=1"

# Upload test
curl -X POST http://localhost:5000/api/upload \
  -F "file=@test.jpg"
```

## Performance Issues

### Slow API Responses

**Cause**: Database query performance

**Solutions**:
1. Check database connection
2. Verify indexes on frequently queried columns
3. Limit query results (already done: `.limit(100)`)
4. Check for N+1 queries

### Slow Frontend

**Cause**: Large bundle size or unoptimized images

**Solutions**:
```bash
# Check bundle size
npm run build

# Analyze bundle
npm run build -- --analyze

# Optimize images
# Images are auto-compressed to 800px width
```

## Getting Help

1. **Check logs**:
   - Browser console (DevTools)
   - Backend terminal output
   - Network requests (DevTools Network tab)

2. **Test components**:
   - Database: `python test_db.py`
   - API: `curl http://localhost:5000/api/health`
   - Frontend: Check console for errors

3. **Verify configuration**:
   - `.env` file settings
   - Database credentials
   - API base URL
   - Port numbers

4. **Restart services**:
   - Stop and restart backend
   - Stop and restart frontend
   - Clear browser cache

---

**Still having issues? Check the logs and error messages carefully!**
