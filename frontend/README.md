# 🏥 HealthyConnect Frontend

A modern React TypeScript frontend for the HealthyConnect telehealth platform, built with Vite, Redux Toolkit, and Tailwind CSS.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Vite** for fast development and building
- **Socket.io** for real-time communication
- **Responsive design** for all devices

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS + shadcn/ui
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Routing**: React Router (planned)

## 📁 Project Structure

```
src/
├── Api/                    # API endpoints
│   ├── auth.api.ts        # Authentication API
│   ├── appointment.api.ts # Appointment management
│   ├── doctor.api.ts      # Doctor profiles
│   ├── patient.api.ts     # Patient profiles
│   ├── message.api.ts     # Messaging
│   ├── review.api.ts      # Doctor reviews
│   ├── user.api.ts        # User profiles
│   └── notification.api.ts # Notifications
├── Redux/                 # State management
│   ├── store.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   ├── authSlice/         # Authentication state
│   ├── appointmentSlice/  # Appointment state
│   ├── doctorSlice/       # Doctor state
│   ├── patientSlice/      # Patient state
│   ├── chatSlice/         # Chat state
│   ├── reviewSlice/       # Review state
│   ├── notificationSlice/ # Notification state
│   └── userSlice/         # User state
├── components/            # Reusable components
├── layout/               # Layout components
├── pages/                # Page components
├── types/                # TypeScript type definitions
├── lib/                  # Utility functions
└── config/               # Configuration files
```

## 🔧 Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📊 Redux State Management

### Store Configuration
The Redux store is configured with the following slices:

- **auth**: User authentication state
- **appointment**: Appointment management
- **doctor**: Doctor profiles and search
- **patient**: Patient profiles
- **chat**: Real-time messaging
- **review**: Doctor reviews
- **notification**: User notifications
- **user**: User profile management

### Using Redux Hooks
```typescript
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import { fetchAppointments } from '../Redux/appointmentSlice/appointmentSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { appointments, loading } = useAppSelector(state => state.appointment);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // ... rest of component
}
```

## 🌐 API Integration

### API Structure
All API calls are centralized in the `Api/` directory:

```typescript
// Example: Creating an appointment
import { createAppointment } from '../Api/appointment.api';

const handleSubmit = async (data) => {
  try {
    const response = await createAppointment(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Error Handling
The axios instance includes interceptors for:
- Automatic authentication token handling
- Global error handling (401 redirects to login)
- Request/response logging

## 🔌 Real-time Features

### Socket.io Integration
Real-time features are handled through Socket.io:

```typescript
import { getSocket } from '../lib/socket';

const socket = getSocket('/chat');
socket.on('new-message', (message) => {
  // Handle new message
});
```

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with custom components from shadcn/ui.

### Utility Functions
Common utility functions are available in `lib/utils.ts`:
- Date formatting
- String manipulation
- Validation helpers
- Storage utilities
- Debounce/throttle functions

## 📱 Component Architecture

### Layout Components
- **LandingLayout**: Public landing page
- **PatientLayout**: Patient dashboard and features
- **DoctorLayout**: Doctor dashboard and features

### Reusable Components
- **ui/**: Basic UI components (buttons, cards, etc.)
- **authComponent/**: Authentication forms
- **chat/**: Messaging components
- **LoadingPage/**: Loading and hero components

## 🚦 Development Workflow

1. **Feature Development**:
   - Create/update Redux slice
   - Add API endpoints
   - Build UI components
   - Connect to Redux state

2. **State Management**:
   - Use `useAppSelector` to read state
   - Use `useAppDispatch` to dispatch actions
   - Follow Redux Toolkit patterns

3. **API Integration**:
   - Add new endpoints to appropriate API file
   - Handle loading, success, and error states
   - Use proper TypeScript types

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🔒 Security Features

- CSRF protection through cookies
- Secure HTTP-only cookies
- Input validation and sanitization
- Role-based access control

## 🌍 Internationalization

The app is prepared for internationalization with:
- Centralized text constants
- Date/time formatting utilities
- Language-aware components

## 📈 Performance Optimization

- Code splitting with dynamic imports
- Memoized components with React.memo
- Optimized Redux selectors
- Lazy loading for routes

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Follow Redux Toolkit best practices
4. Write meaningful commit messages
5. Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License.
