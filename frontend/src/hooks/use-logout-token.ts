import { useNavigate } from "react-router";
import { useCallback } from "react";
import { queryClient } from "#/query-client-config";

export function useLogoutToken() {
  const navigate = useNavigate();
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/login", { replace: true });
  }, [navigate]);

  return { logout };
}
