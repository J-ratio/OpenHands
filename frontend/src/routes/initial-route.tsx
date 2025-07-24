import { useEffect } from "react";
import { useNavigate } from "react-router";
import HomeScreen from "./home";
import { useAuthTokenStatus } from "#/hooks/use-auth-token";

export default function InitialRoute() {
  const { isAuthenticated, isLoading, message, token } = useAuthTokenStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, token, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <HomeScreen />;
}
