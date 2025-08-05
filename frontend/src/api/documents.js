import { routes } from "../constants/apiRoutes";
import { isAuthenticated as getAuthStatus } from "../utils/isAuth";
import axios from "axios";
// import { revalidatePath } from "next/cache";
import { getAllWorkspaces } from "./workspaces";
import { handleError } from "../utils/handleError";

export const createDocument = async ({
  name,
  content,
  workspace_id,
  template_id,
}) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const requestBody = {
      name,
      content,
      workspace_id: Number(workspace_id),
      template_id: Number(template_id),
    };

    const res = await axios.post(routes.createDocuments, requestBody, {
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
    handleError(routes.createDocuments, error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const getAllDocuments = async (workspaceId) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const workspacesResponse = await getAllWorkspaces();
    if (!workspacesResponse.success) {
      return {
        errorMessage: workspacesResponse.errorMessage,
        success: false,
      };
    }

    const params = {};
    if (workspaceId) {
      params.workspace_id = workspaceId;
    }

    const { data: documents } = await axios.get(routes.getAllDocuments, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    const workspaceMap = new Map(
      workspacesResponse.data.map((workspace) => [
        workspace.id,
        workspace.name,
      ]),
    );

    const enrichedDocuments = documents
      .map((doc) => ({
        ...doc,
        workspaceName: workspaceMap.get(doc.workspace_id) || "Unknown",
      }))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    return { success: true, data: enrichedDocuments };
  } catch (error) {
    handleError(routes.getAllDocuments, error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const getASingleDocument = async (id) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.get(routes.getADocument(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.getADocument(id), error);

    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const updateDocument = async ({
  name,
  content,
  workspace_id,
  template_id,
  docId,
}) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const requestBody = {
      name,
      content,
      content_type: "MARKDOWN",
      workspace_id: Number(workspace_id),
      template_id: Number(template_id),
    };

    const res = await axios.put(routes.updateADocument(docId), requestBody, {
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
    handleError(routes.updateADocument(docId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const deleteDocument = async (id) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.delete(routes.deleteADocument(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // revalidatePath("/documents");
    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.deleteADocument(id), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};
