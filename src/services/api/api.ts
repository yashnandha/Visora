import { store } from "@redux/store";
import { navigateAndSimpleReset } from "@utility/navigationService";
import axios from "axios";
import { Platform } from "react-native";
import constant from "../config/constant";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();
let isLoggedIn = true;
let isForbidden = false;
const baseURL = constant.baseURL
const axiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // const { token } = store.getState().userReducer;
    // if (token) {
    //   config.headers["auth"] = token;
    //   isLoggedIn = true;
    //   isForbidden = false;
    // }

    try {
      config.headers.set("deviceType", Platform.OS);
    } catch (err) { }

    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  async (response) => {
    return response;
  },
  async function (error) {
    if (error?.response?.status == 401 && isLoggedIn) {
      // navigateAndSimpleReset('login', 0);
      // Toast('Some')
      isLoggedIn = false;
    } else if (error?.response?.status == 403 && !isForbidden) {
      isForbidden = true;
      navigateAndSimpleReset("accountForbidden", 0);
    } else if (
      error?.response?.status == 500 &&
      error?.response?.data?.message == "Internal server error"
    ) {
    } else if (error?.response?.status === 422) {
    }

    return Promise.reject(error.response);
  },
);

export { axiosInstance };
