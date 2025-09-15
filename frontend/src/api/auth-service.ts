import { routes } from "#/constants/apiRoutes";
import axios from "axios";
import qs from "qs";
import { openHands } from "./open-hands-axios";

export async function login(email: string, password: string) {
  const formData = qs.stringify({
    username: email,
    password: password,
    grant_type: "password",
    scope: "",
    client_id: "",
    client_secret: "",
  });

  const response = await axios.post(routes.login, formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.data && response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }

  return response;
}

export async function register(email: string, password: string) {
  const response = await axios.post(routes.register, {
    email,
    password,
  });
  return response;
}

export async function checkAuth() {
  return openHands.get(routes.profile);
}
