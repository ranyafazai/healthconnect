// frontend/src/components/Auth/AuthForm.tsx
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../Redux/hooks";
import { login, register } from "../../Api/auth.api";
import { setAuth } from "../../Redux/authSlice/authSlice";
import type { UserLite } from "../../types/user";

interface AuthFormProps {
  type: "signin" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "PATIENT" as "DOCTOR" | "PATIENT"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isSignUp = type === "signup";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!formData.firstName.trim()) {
        setError("First name is required");
        return false;
      }
      if (!formData.lastName.trim()) {
        setError("Last name is required");
        return false;
      }
      if (!formData.phone.trim()) {
        setError("Phone number is required");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      let response;
      
      if (isSignUp) {
        const signupData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role
        };
        response = await register(signupData);
      } else {
        response = await login({ email: formData.email, password: formData.password });
      }

      // Extract user data from response
      const userData = response.data.user;
      console.log('Login successful, user data:', userData);
      
      // Store user data in Redux
      const user: UserLite = {
        id: userData.id,
        email: userData.email,
        role: userData.role
      };
      
      console.log('Dispatching auth to Redux:', user);
      dispatch(setAuth(user));
      
      // Redirect based on user role
      if (user.role === 'DOCTOR') {
        console.log('Redirecting to doctor dashboard');
        navigate('/doctor/dashboard');
      } else {
        console.log('Redirecting to patient dashboard');
        navigate('/patient/dashboard');
      }
      
      // Add a small delay to ensure Redux state is updated
      setTimeout(() => {
        console.log('Current auth state after login:', { isAuthenticated: true, user });
      }, 100);
      
    } catch (err: any) {
      // Handle API error shape from backend controllers
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {isSignUp && (
          <>
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200"
                    placeholder="Enter first name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
              </select>
            </div>
          </>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (Sign Up only) */}
        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008CBA] focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#008CBA] to-[#007BAA] hover:from-[#007BAA] hover:to-[#006699] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </div>
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <a href="/auth/signin" className="text-[#008CBA] hover:text-[#007BAA] font-semibold transition-colors">
                Sign in here
              </a>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-[#008CBA] hover:text-[#007BAA] font-semibold transition-colors">
                Sign up here
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
