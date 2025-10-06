import { AxiosError } from "axios";
import {
  isAxiosErrorWithErrorField,
  isAxiosErrorWithMessageField,
  isAxiosErrorWithStringData,
} from "./type-guards";

/**
 * Retrieve the error message from an Axios error
 * @param error The error to render a toast for
 */
export const retrieveAxiosErrorMessage = (error: AxiosError) => {
  let errorMessage: string | null = null;

  if (isAxiosErrorWithErrorField(error) && error.response?.data.error) {
    errorMessage = error.response?.data.error;
  } else if (
    isAxiosErrorWithMessageField(error) &&
    error.response?.data.message
  ) {
    errorMessage = error.response?.data.message;
  } else if (
    isAxiosErrorWithStringData(error) &&
    (error.response?.data as string).trim()
  ) {
    errorMessage = error.response?.data as string;
  } else {
    errorMessage = error.message;
  }

  return errorMessage;
};
