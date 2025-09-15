// "use server";
import { routes } from "../constants/apiRoutes";
import { handleError } from "../utils/handleError";
import { openHands } from "./open-hands-axios";

export const updateBlock = async (docId, blockId, prompt) => {
  try {
    const res = await openHands.put(routes.editBlock(docId, blockId), {
      type: "TEXT",
      prompt,
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.editBlock(docId, blockId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};
