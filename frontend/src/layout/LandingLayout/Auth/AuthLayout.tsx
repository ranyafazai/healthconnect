import React, { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side: form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {children}
        </div>
      </div>

      {/* Right side: image */}
      <div className="hidden lg:block lg:w-1/2 bg-[#008CBA]">
        <div className="flex items-center justify-center h-full">
          <img
            src="/auth-illustration.png"
            alt="Healthcare"
            className="max-w-md w-full"
          />
        </div>
      </div>
    </div>
  );
}
