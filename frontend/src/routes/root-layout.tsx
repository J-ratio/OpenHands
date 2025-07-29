import React from "react";
import {
  useRouteError,
  isRouteErrorResponse,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import i18n from "#/i18n";
import { useGitHubAuthUrl } from "#/hooks/use-github-auth-url";
import { useAuthTokenStatus } from "#/hooks/use-auth-token";
import { useConfig } from "#/hooks/query/use-config";
import { Sidebar } from "#/components/features/sidebar/sidebar";
import { AuthModal } from "#/components/features/waitlist/auth-modal";
import { ReauthModal } from "#/components/features/waitlist/reauth-modal";
import { useSettings } from "#/hooks/query/use-settings";
import { useBalance } from "#/hooks/query/use-balance";
import { SetupPaymentModal } from "#/components/features/payment/setup-payment-modal";
import { displaySuccessToast } from "#/utils/custom-toast-handlers";
import { useIsOnTosPage } from "#/hooks/use-is-on-tos-page";
import { useAutoLogin } from "#/hooks/use-auto-login";
import { useAuthCallback } from "#/hooks/use-auth-callback";
import { LOCAL_STORAGE_KEYS } from "#/utils/local-storage";
import { EmailVerificationGuard } from "#/components/features/guards/email-verification-guard";
import { Toaster } from "../components/ui/sonner";
import { useWorkspace, WorkspaceProvider } from "#/context/WorkspaceContext";
import { WorkspaceSelect } from "#/components/features/documents/_components/WorkspaceSelect";

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <pre>
          {error.data instanceof Object
            ? JSON.stringify(error.data)
            : error.data}
        </pre>
      </div>
    );
  }
  if (error instanceof Error) {
    return (
      <div>
        <h1>{t(I18nKey.ERROR$GENERIC)}</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>{t(I18nKey.ERROR$UNKNOWN)}</h1>
    </div>
  );
}

export default function MainApp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOnTosPage = useIsOnTosPage();
  const { data: settings } = useSettings();
  const { error } = useBalance();
  const { t } = useTranslation();

  const config = useConfig();
  const { isAuthenticated, isLoading: isFetchingAuth } = useAuthTokenStatus();

  // Always call the hook, but we'll only use the result when not on TOS page
  const gitHubAuthUrl = useGitHubAuthUrl({
    appMode: config.data?.APP_MODE || null,
    gitHubClientId: config.data?.GITHUB_CLIENT_ID || null,
  });

  // When on TOS page, we don't use the GitHub auth URL
  const effectiveGitHubAuthUrl = isOnTosPage ? null : gitHubAuthUrl;

  // Auto-login if login method is stored in local storage
  useAutoLogin();

  // Handle authentication callback and set login method after successful authentication
  useAuthCallback();

  React.useEffect(() => {
    // Don't change language when on TOS page
    if (!isOnTosPage && settings?.LANGUAGE) {
      i18n.changeLanguage(settings.LANGUAGE);
    }
  }, [settings?.LANGUAGE, isOnTosPage]);

  React.useEffect(() => {
    if (settings?.IS_NEW_USER && config.data?.APP_MODE === "saas") {
      displaySuccessToast(t(I18nKey.BILLING$YOURE_IN));
    }
  }, [settings?.IS_NEW_USER, config.data?.APP_MODE]);

  React.useEffect(() => {
    // Don't do any redirects when on TOS page
    // Don't allow users to use the app if it 402s
    if (!isOnTosPage && error?.status === 402 && pathname !== "/") {
      navigate("/");
    }
  }, [error?.status, pathname, isOnTosPage]);

  // Function to check if login method exists in local storage
  const checkLoginMethodExists = React.useCallback(() => {
    // Only check localStorage if we're in a browser environment
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.LOGIN_METHOD) !== null;
    }
    return false;
  }, []);

  // State to track if login method exists
  const [loginMethodExists, setLoginMethodExists] = React.useState(
    checkLoginMethodExists(),
  );

  // Listen for storage events to update loginMethodExists when logout happens
  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_KEYS.LOGIN_METHOD) {
        setLoginMethodExists(checkLoginMethodExists());
      }
    };

    // Also check on window focus, as logout might happen in another tab
    const handleWindowFocus = () => {
      setLoginMethodExists(checkLoginMethodExists());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [checkLoginMethodExists]);

  // Check login method status when auth status changes
  React.useEffect(() => {
    // When auth status changes (especially on logout), recheck login method
    setLoginMethodExists(checkLoginMethodExists());
  }, [isAuthenticated, checkLoginMethodExists]);

  const renderAuthModal =
    !isAuthenticated &&
    !isFetchingAuth &&
    !isOnTosPage &&
    config.data?.APP_MODE === "saas" &&
    !loginMethodExists; // Don't show auth modal if login method exists in local storage

  const renderReAuthModal =
    !isAuthenticated &&
    !isFetchingAuth &&
    !isOnTosPage &&
    config.data?.APP_MODE === "saas" &&
    loginMethodExists;

  return (
    <WorkspaceProvider>
      <div
        data-testid="root-layout"
        className="bg-base p-3 h-screen md:min-w-[1024px] flex flex-col md:flex-row gap-3 overflow-y-hidden"
      >
        <Toaster />
        <Sidebar />
        <div
          id="root-outlet"
          className="h-[calc(100%-50px)] md:h-full w-full relative"
        >
          <WorkspaceSelector />
          <EmailVerificationGuard>
            <Outlet />
          </EmailVerificationGuard>
        </div>

        {renderAuthModal && (
          <AuthModal
            githubAuthUrl={effectiveGitHubAuthUrl}
            appMode={config.data?.APP_MODE}
          />
        )}
        {renderReAuthModal && <ReauthModal />}

        {config.data?.FEATURE_FLAGS.ENABLE_BILLING &&
          config.data?.APP_MODE === "saas" &&
          settings?.IS_NEW_USER && <SetupPaymentModal />}
      </div>
    </WorkspaceProvider>
  );
}

const WorkspaceSelector = () => {
  const {
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    workspaces,
    setWorkspaces,
    setSelectedWorkspaceName,
  } = useWorkspace();

  return (
    <div className="flex mb-2 justify-end home-workspace-select-highlight items-end">
      <div className="flex items-center gap-2 max-w-[500px]">
        <span className="font-semibold text-white/60">Workspace:</span>
        <WorkspaceSelect
          selectedWorkspace={selectedWorkspaceId && Number(selectedWorkspaceId)}
          setSelectedWorkspace={setSelectedWorkspaceId}
          workspaces={workspaces}
          setWorkspaces={setWorkspaces}
          setSelectedWorkspaceName={setSelectedWorkspaceName}
        />
      </div>
    </div>
  );
};
