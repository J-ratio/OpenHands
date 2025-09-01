import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export const getStatusIcon = (status) => {
  switch (status) {
    case "available":
    case "operational":
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case "unavailable":
      return <XCircle className="h-4 w-4 mr-1" />;
    default:
      return <AlertCircle className="h-4 w-4 mr-1" />;
  }
};

export const formatStatusText = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);
