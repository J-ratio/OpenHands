"use server";
import { routes } from "../constants/apiRoutes";
import { isAuthenticated as getAuthStatus } from "../utils/isAuth";
import axios from "axios";
import { handleError } from "../utils/handleError";

export const createADatasource = async ({
  name,
  type,
  url,
  workspace_ids,
  PAT_TOKEN,
}) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    if (!type) {
      return {
        errorMessage: "Type is required",
        success: false,
      };
    }

    // Assign the name like this if the type is GIT_REPOSITORY
    if (!name && type === "GIT_REPOSITORY") {
      const urlParts = url.split("/");
      name =
        urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
    }

    const requestBody = {
      name,
      type,
      url: url ?? null,
      workspace_ids: Array.isArray(workspace_ids) ? workspace_ids : null,
      token: PAT_TOKEN ?? "",
    };

    const res = await axios.post(routes.createDataSources, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.createDataSources, error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const getAllDataSourcesByWorkspaceId = async (workspaceId) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.get(routes.getAllDataSources, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        workspace_id: workspaceId,
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.getAllDataSources(workspaceId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const syncCodebase = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        error: "Id is required",
      };
    }
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.put(
      routes.refetchTheLatestGitCommit(id),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.refetchTheLatestGitCommit(id), error);
    return {
      success: false,
      error: error?.response?.data?.detail,
    };
  }
};

export const getADataSourceById = async () => {};

export const updateADataSource = async () => {};

export const deleteADataSource = async (id) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.delete(routes.deleteADataSource(id), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.deleteADataSource(id), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const updateADataSourceWithFile = async ({ file, docId }) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.put(
      routes.updateDataSourceWithFile(docId),
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.updateDataSourceWithFile(docId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};
