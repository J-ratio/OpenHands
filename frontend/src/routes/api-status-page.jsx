import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getStatusIcon, formatStatusText } from "../utils/api-status-utils";
import { cn } from "../utils/utils";
import { getServicesStatus, getStatus } from "../api/api-status";

const StatusPage = () => {
  const [backendStatus, setBackendStatus] = useState(false);
  const [serviceData, setServiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getBadgeColor = (status) => {
    if (status === "operational" || status === true) return "bg-green-500";
    if (status === "error" || status === false) return "bg-red-500";
    return "bg-yellow-500";
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Check backend status
      const { success: status } = await getStatus();
      const isBackendAvailable = status === "available";
      setBackendStatus(isBackendAvailable);

      // Get services status if backend is available
      if (isBackendAvailable) {
        const servicesStatus = await getServicesStatus();
        if (servicesStatus?.success) {
          setServiceData(servicesStatus.data?.dependencies || null);
        } else {
          setServiceData(null);
        }
      } else {
        setServiceData(null);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
      setBackendStatus(false);
      setServiceData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="pt-10 h-screen">
      <section className="container mx-auto">
        <div className="container mx-auto flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">System Status</h1>
          <Button
            variant="outline"
            className="flex items-center gap-x-2"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCcw className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Loading..." : "Refetch the Data"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <p className="text-lg">Loading...</p>
          </div>
        ) : (
          <>
            <Card className="p-6 mb-4 border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Backend Connection</h2>
              <div className="flex items-center space-x-2">
                <span className="mr-2 text-lg">Backend:</span>
                <Badge className={getBadgeColor(backendStatus)}>
                  {backendStatus ? "Reachable" : "Unreachable"}
                </Badge>
              </div>
            </Card>

            {backendStatus ? (
              serviceData ? (
                <Card className="p-6 border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    Dependencies Status
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(serviceData).map(([service, status]) => (
                      <ServiceStatus
                        key={service}
                        service={service}
                        status={status}
                      />
                    ))}
                  </div>
                </Card>
              ) : (
                <p className="text-muted-foreground">
                  No dependency status available.
                </p>
              )
            ) : (
              <p className="text-muted-foreground">
                Backend unreachable. Cannot fetch service status.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
};

const ServiceStatus = ({ service, status }) => {
  const statusValue = typeof status === "object" ? status.status : status;
  const error = typeof status === "object" ? status.error : null;
  const version = typeof status === "object" ? status.version : null;

  return (
    <div className="flex flex-col p-3 border rounded-md">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-muted-foreground">
          {service}
        </span>
        <Badge
          className={cn(
            "flex items-center gap-x-1",
            statusValue === "operational"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white",
          )}
        >
          {getStatusIcon(statusValue)}
          {formatStatusText(statusValue)}
        </Badge>
      </div>
      {version && (
        <div className="text-xs text-muted-foreground mt-1">
          Version: {version}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 mt-1 break-words">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default StatusPage;
