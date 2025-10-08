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
import { login as loginApi } from "#/api/auth-service";
import { validateEmail } from "#/utils/validators";
import OpenHands from "#/api/open-hands";

export default function Login() {
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
      await loginApi(email, password);
      displaySuccessToast("Login successful!");
      setTimeout(() => navigate("/"), 100);
      OpenHands.triggerPrewarm().catch((error) => {
        console.warn("Failed to trigger container pre-warming:", error);
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login failed. Please try again.";
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
          <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            Sign in to your account to continue
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
            placeholder="Enter your password"
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
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </BrandButton>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-400">Don't have an account? </span>
            <Link
              to="/register"
              className="text-primary hover:text-primary/80 underline font-medium"
            >
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
