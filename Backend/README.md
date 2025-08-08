# 🏥 HealthyConnect Backend API

A comprehensive telehealth platform backend built with Node.js, Express, Prisma, and Socket.IO.

## 🚀 Features

### Core Features
- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Real-time Communication** - Socket.IO for chat, notifications, and video calls
- **WebRTC Video Calls** - Peer-to-peer video consultations with STUN/TURN support
- **File Management** - Secure file uploads with cloud storage support
- **Appointment Management** - Complete appointment lifecycle management
- **Messaging System** - Real-time chat between doctors and patients
- **Review System** - Patient reviews and ratings for doctors
- **Notification System** - Real-time notifications via WebSocket
- **Medical Records** - Secure medical record management
- **Payment Integration** - Stripe payment processing

### Security Features
- Rate limiting and request throttling
- Input validation and sanitization
- CORS configuration
- Security headers
- JWT token management
- Role-based access control

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL >= 8.0 or PostgreSQL >= 13

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthyConnect/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with the required variables (see Environment Variables section).

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="mysql://username:password@localhost:3306/healthyconnect"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_EXPIRES_MS=86400000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@healthyconnect.com

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe Payments (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WebRTC TURN Server (Optional)
TURN_SERVER_URL=turn:your-turn-server.com:3478
TURN_USERNAME=your-username
TURN_CREDENTIAL=your-credential

# Feature Flags
ENABLE_VIDEO_CALLS=true
ENABLE_FILE_UPLOADS=true
ENABLE_NOTIFICATIONS=true
ENABLE_PAYMENTS=false
ENABLE_SMS=false
ENABLE_EMAIL=false
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (doctor or patient)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "DOCTOR" // or "PATIENT"
}
```

#### POST `/api/auth/login`
Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/logout`
Logout user (requires authentication)

#### GET `/api/auth/me`
Get current user profile (requires authentication)

### Doctor Endpoints

#### GET `/api/doctors`
Get all doctors with filters

#### GET `/api/doctors/:id`
Get specific doctor details

#### PUT `/api/doctors/profile`
Update doctor profile (requires doctor authentication)

#### GET `/api/doctors/:id/appointments`
Get doctor's appointments

#### GET `/api/doctors/:id/reviews`
Get doctor's reviews

### Patient Endpoints

#### GET `/api/patients/profile`
Get patient profile (requires patient authentication)

#### PUT `/api/patients/profile`
Update patient profile (requires patient authentication)

#### GET `/api/patients/appointments`
Get patient's appointments

#### GET `/api/patients/medical-records`
Get patient's medical records

### Appointment Endpoints

#### POST `/api/appointments`
Create new appointment

#### GET `/api/appointments`
Get appointments (filtered by user role)

#### GET `/api/appointments/:id`
Get specific appointment

#### PUT `/api/appointments/:id`
Update appointment

#### DELETE `/api/appointments/:id`
Cancel appointment

### Message Endpoints

#### POST `/api/messages`
Send a message

#### GET `/api/messages`
Get conversation messages

#### PUT `/api/messages/:id/read`
Mark message as read

### Video Call Endpoints

#### POST `/api/video-calls`
Create video call session

#### GET `/api/video-calls/:id`
Get video call details

#### PUT `/api/video-calls/:id/end`
End video call

#### GET `/api/webrtc-config`
Get WebRTC configuration

## 🔌 Socket.IO Events

### Chat Namespace (`/chat`)

#### Client Events
- `join-user` - Join user's personal chat room
- `join-appointment` - Join appointment chat room
- `send-message` - Send a message
- `mark-read` - Mark message as read
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator

#### Server Events
- `joined` - Confirmation of joining room
- `new-message` - New message received
- `message-sent` - Message sent confirmation
- `message-read` - Message read notification
- `user-typing` - User typing indicator
- `appointment-message` - Message in appointment context

### Video Call Namespace (`/video-call`)

#### Client Events
- `join-user` - Join user's personal video call room
- `join-call` - Join specific video call
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate
- `mute-audio` - Mute/unmute audio
- `mute-video` - Mute/unmute video
- `screen-share` - Start/stop screen sharing
- `start-recording` - Start call recording
- `stop-recording` - Stop call recording
- `end-call` - End video call

#### Server Events
- `call-joined` - Confirmation of joining call
- `user-joined-call` - User joined call notification
- `user-disconnected` - User disconnected notification
- `call-ended` - Call ended notification
- `recording-started` - Recording started notification
- `recording-stopped` - Recording stopped notification

### Notification Namespace (`/notifications`)

#### Client Events
- `join-user` - Join user's notification room

#### Server Events
- `new-notification` - New notification received
- `notification-read` - Notification read confirmation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="auth"
```

## 📊 Monitoring

### Health Check
```bash
GET /health
```

### Socket Status
```bash
GET /api/socket-status
```

### API Documentation
```bash
GET /api
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database URL
- Set up proper CORS origins
- Configure cloud storage
- Set up monitoring and logging

## 🔒 Security Considerations

1. **JWT Tokens**: Use strong secrets and implement token refresh
2. **Rate Limiting**: Configure appropriate rate limits
3. **Input Validation**: All inputs are validated and sanitized
4. **File Uploads**: Implement file type and size restrictions
5. **CORS**: Configure proper CORS settings for production
6. **HTTPS**: Use HTTPS in production
7. **Database**: Use connection pooling and prepared statements
8. **Logging**: Implement proper logging without sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@healthyconnect.com or create an issue in the repository.
