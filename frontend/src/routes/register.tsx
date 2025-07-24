import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { BrandButton } from "#/components/features/settings/brand-button";
import { LoadingSpinner } from "#/components/shared/loading-spinner";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import H2LoopLogo from "#/assets/branding/h2loop-logo.svg?react";
import { register as registerApi } from "#/api/auth-service";
import { validateEmail } from "#/utils/validators";
import { createWorkspace } from "#/api/workspaces";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await registerApi(email, password);
      const accessToken = response?.data?.access_token;
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }
      const createWsResponse = await createWorkspace(
        "Default Workspace",
        "This is your default workspace, automatically created during registration. It will be used unless you create or switch to another workspace.",
      );
      if (!createWsResponse.success) {
      }
      displaySuccessToast(
        response.data.message ?? "Registration successful! Please log in.",
      );
      setTimeout(() => navigate("/login"), 100);
    } catch (err: any) {
      console.log(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(msg);
      displayErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-secondary p-4">
      <div className="bg-base border border-tertiary rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <H2LoopLogo width={80} height={80} className="mb-4" />
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            Join us and start building amazing things
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <SettingsInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email address"
            required
            className="w-full"
          />
          <SettingsInput
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Create a strong password"
            required
            className="w-full"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-3">
              <div className="text-red-400 text-sm text-center">{error}</div>
            </div>
          )}

          <BrandButton
            type="submit"
            variant="primary"
            isDisabled={loading}
            className="w-full h-12 text-base font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="small" />
                <span>Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </BrandButton>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-400">Already have an account? </span>
            <Link
              to="/login"
              className="text-primary hover:text-primary/80 underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
