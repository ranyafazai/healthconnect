# 🏥 HealthyConnect

**HealthyConnect** is a full-stack telehealth platform that enables seamless communication between **Patients** and **Doctors** through **text** or **video consultations**. The app provides personalized dashboards, appointment management, messaging, and detailed profiles for both roles.

## 🌐 Live Application

**🚀 [Visit the Live App](https://ranyafazai.github.io/healthconnect/)** - Your HealthyConnect telehealth platform is now live! 🎉

*Backend successfully deployed on Railway - Frontend deploying via GitHub Pages*

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourTeam-dev/HealthyConnect.git
   cd HealthyConnect
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp env.example .env
   # Configure your .env file with database and other settings
   npm run prisma:setup
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 🚀 Key Features

### ✅ Authentication
- **Login / Register** for:
  - Patients
  - Doctors

---

## 🌐 Landing Page (Public)
- Hero section with app introduction
- General information about the platform
- Testimonials and reviews from real users
- Call-to-action for login or registration

---

## 👨‍⚕️ Doctor Features

### 1. Doctor Dashboard
- Overview of:
  - Appointments Today
  - Unread Messages
  - Average Review Rating
  - Total Reviews Count

### 2. Appointments Layout
- List of all upcoming and past appointments
- Status indicators (confirmed, pending, completed)

### 3. Messaging + Video Call
- Secure real-time chat system
- One-on-one video consultation interface

### 4. Reviews & Feedback
- List of patient feedback
- Rating distribution chart
- Highlighted top reviews

### 5. Doctor Profile
Organized into 4 sections:
- **Basic Information:** Photo, First Name, Last Name, Professional Bio
- **Contact Information:** Email, Phone Number, Office Address, City, State, Zip Code, Emergency Contact
- **Professional Details:** Specialization, Years of Experience, Medical License Number, Certification & Education
- **Availability Settings:** Weekly schedule, Appointment Duration, Buffer Time

### 6. Appointment Management
- Overview panel showing:
  - Total Appointments Today
  - Pending Appointments
- Easy list management

---

## 🧑‍💻 Patient Features

### 1. Patient Dashboard
- Overview of:
  - Upcoming Appointments
  - Completed Appointments
  - New Messages
  - Health Records
- List of next appointments with confirmation buttons
- Recent Messages panel

### 2. Appointments Layout
- Full list of all appointments
- Quick stats (today's appointments, pending, etc.)

### 3. Past Consultations
- History of consultations with details

### 4. Messaging
- Secure chat with doctors
- Integrated video call option

### 5. Patient Profile
- Editable profile with basic details

### 6. Settings
- Notification preferences
- Privacy settings
- Account info

### 7. Doctor Search & Booking
- **Search Page:**
  - Filter by specialization, rating, availability, etc.
- **Doctor Detail Page:**
  - About the Doctor
  - Patient Reviews
  - Availability Calendar
  - **Booking Button**

### 8. Appointment Booking Flow
Step-by-step:
1. **Pick a Date/Time**
2. **Choose Consultation Type:** Text or Video
3. **Patient Info Form:**
   - Full Name
   - Email
   - Phone Number
   - Date of Birth
   - Reason for Visit
   - Medical History
4. **Confirmation Screen**

---

## 🚀 Deployment

### Frontend Deployment (GitHub Pages)
The frontend is automatically deployed to GitHub Pages when you push to the main branch.

**Live URL:** https://ranyafazai.github.io/healthconnect/

### Backend Deployment Options

#### Option 1: Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

#### Option 2: Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd Backend && npm install && npm run build`
4. Set start command: `cd Backend && npm start`

#### Option 3: Heroku
1. Create a new Heroku app
2. Connect your GitHub repository
3. Set buildpacks and environment variables
4. Enable automatic deploys

### Environment Variables for Production

Create a `.env` file in the Backend directory with:

```env
# Database
DATABASE_URL="your-production-database-url"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Server
NODE_ENV="production"
PORT=5000
FRONTEND_URL="https://ranyafazai.github.io/healthconnect"

# CORS
FRONTEND_URLS="https://ranyafazai.github.io/healthconnect"

# Add other production environment variables as needed
```

### Custom Domain Setup
To use a custom domain instead of GitHub Pages:

1. Add your domain to the repository settings
2. Update the `index.html` redirect URL
3. Configure DNS settings
4. Update CORS settings in backend


