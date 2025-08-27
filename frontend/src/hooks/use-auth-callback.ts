import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthTokenStatus } from "#/hooks/use-auth-token";
import { LoginMethod, setLoginMethod } from "#/utils/local-storage";
import { useConfig } from "./query/use-config";

/**
 * Hook to handle authentication callback and set login method after successful authentication
 */
export const useAuthCallback = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthTokenStatus();
  const { data: config } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run in SAAS mode
    if (config?.APP_MODE !== "saas") {
      return;
    }

    // Wait for auth to load
    if (isAuthLoading) {
      return;
    }

    // Only set login method if authentication was successful
    if (!isAuthenticated) {
      return;
    }

    // Check if we have a login_method query parameter
    const searchParams = new URLSearchParams(location.search);
    const loginMethod = searchParams.get("login_method");

    // Set the login method if it's valid
    if (Object.values(LoginMethod).includes(loginMethod as LoginMethod)) {
      setLoginMethod(loginMethod as LoginMethod);

      // Clean up the URL by removing the login_method parameter
      searchParams.delete("login_method");
      const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      navigate(newUrl, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, location.search, config?.APP_MODE]);
};
