// frontend/src/components/Auth/AuthForm.tsx
import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { login, register } from "../../Api/auth.api";

interface AuthFormProps {
  type: "signin" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const isSignUp = type === "signup";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignUp) {
        await register(formData);
      } else {
        await login(formData);
      }

      // successful auth: reload to root (or you can programmatically navigate)
      window.location.href = "/";
    } catch (err: any) {
      // handle API error shape from backend controllers
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors && err.response.data.errors[0]?.msg) ||
        "Something went wrong";
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008CBA] focus:ring-[#008CBA] sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#008CBA] focus:ring-[#008CBA] sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full bg-[#008CBA] hover:bg-[#007BAA] text-white rounded-lg py-2 font-medium transition"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </div>
    </form>
  );
}
