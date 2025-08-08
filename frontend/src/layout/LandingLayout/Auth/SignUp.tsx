
import AuthLayout from "./AuthLayout";
import AuthForm from "../../../components/authComponent/AuthForm"


export default function SignUp() {
  return (
    <AuthLayout title="Create a new account">
      <AuthForm type="signup" />
    </AuthLayout>
  );
}
