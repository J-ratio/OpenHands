// "use server";
import axios from "axios";
import { routes } from "../constants/apiRoutes";
import { isAuthenticated as getAuthStatus } from "../utils/isAuth";
import { handleError } from "../utils/handleError";

export const createTemplate = async (name, description, content) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    if (!name || !content) {
      return {
        errorMessage: "Template name and content are required",
        success: false,
      };
    }

    const res = await axios.post(
      routes.createTemplate,
      {
        name,
        description,
        content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.createTemplate, error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const getAllTemplates = async () => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.get(routes.getAllTemplates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.getAllTemplates, error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const getTemplate = async (templateId) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.get(routes.getTemplate(templateId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.getTemplate(templateId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const updateATemplate = async ({ templateId, name, content }) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    // NOTE: workspace_id is not implemented as of now
    const requestBody = {
      name,
      content,
      // workspace_id
    };

    const res = await axios.put(
      routes.updateTemplate(templateId),
      requestBody,
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
    handleError(routes.updateTemplate(templateId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const updateATemplateWithFile = async ({ file, templateId }) => {
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
      routes.updateTemplateWithFile(templateId),
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
    handleError(routes.updateTemplateWithFile(templateId), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};

export const deleteTemplate = async (id) => {
  try {
    const { isAuthenticated, token, message } = getAuthStatus();

    if (!isAuthenticated) {
      return {
        errorMessage: message,
        success: false,
      };
    }

    const res = await axios.delete(routes.deleteTemplate(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (error) {
    handleError(routes.deleteTemplate(id), error);
    return {
      errorMessage: error?.response?.data?.detail,
      success: false,
    };
  }
};
