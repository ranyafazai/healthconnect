import React from "react";
import AuthLayout from "./AuthLayout";
import AuthForm from "../../../components/authComponent/AuthForm";

export default function SignIn() {
  return (
    <AuthLayout title="Sign in to your account">
      <AuthForm type="signin" />
    </AuthLayout>
  );
}
