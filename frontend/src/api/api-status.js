import { routes } from "../constants/apiRoutes";
import { handleError } from "../utils/handleError";
import { openHands } from "./open-hands-axios";

export const getStatus = async () => {
  try {
    const res = await axios.get(routes.baseURL, {
      timeout: 5000,
    });
    return {
      success: res.status === 200 ? "available" : "unavailable",
    };
  } catch (error) {
    handleError(routes.baseURL, error);
    return { success: false };
  }
};

export const getServicesStatus = async () => {
  try {
    const res = await openHands.get(routes.status);

    if (!res.data) {
      throw new Error("Empty response from status API");
    }

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    handleError(routes.status, error);
    return {
      success: false,
      data: null,
    };
  }
};
