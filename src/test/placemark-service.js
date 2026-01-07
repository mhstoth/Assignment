import axios from "axios";
import { serviceUrl } from "./fixtures.js";

const useInject = process.env.USE_INJECT !== "false";
let authHeader = "";

async function getInjectServer() {
  if (!useInject) return null;
  if (global.injectServer) return global.injectServer;
  if (global.injectServerPromise) {
    global.injectServer = await global.injectServerPromise;
    return global.injectServer;
  }
  return null;
}

async function request(method, path, data) {
  if (useInject) {
    const injectServer = await getInjectServer();
    if (!injectServer) {
      throw new Error("Inject server not ready");
    }
    const res = await injectServer.inject({
      method,
      url: path,
      payload: data,
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    if (res.statusCode >= 400) {
      const msg = res.result?.message || res.payload || res.statusMessage;
      const err = new Error(msg || "Request failed");
      err.statusCode = res.statusCode;
      throw err;
    }
    return res.result ?? (res.payload ? JSON.parse(res.payload) : null);
  }

  try {
    const response = await axios({
      method,
      url: `${serviceUrl}${path}`,
      data,
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    return response.data;
  } catch (error) {
    const err = new Error(error.message);
    err.statusCode = error.response?.status;
    err.response = error.response;
    throw err;
  }
}

export const placemarkService = {
  placemarkUrl: serviceUrl,

  async authenticate(user) {
    const data = await request("post", "/api/users/authenticate", { email: user.email, password: user.password });
    authHeader = `Bearer ${data.token}`;
    axios.defaults.headers.common.Authorization = authHeader;
    return data;
  },

  async clearAuth() {
    axios.defaults.headers.common.Authorization = "";
    authHeader = "";
  },

  async createUser(user) {
    return request("post", "/api/users", user);
  },

  async getUser(id) {
    return request("get", `/api/users/${id}`);
  },

  async getAllUsers() {
    return request("get", "/api/users");
  },

  async deleteAllUsers() {
    return request("delete", "/api/users");
  },

  async createPlacemark(placemark) {
    return request("post", "/api/placemarks", placemark);
  },

  async deleteAllPlacemarks() {
    return request("delete", "/api/placemarks");
  },

  async deleteAllUserPlacemarks() {
    return request("delete", "/api/placemarks/user");
  },

  async getPlacemark(id) {
    return request("get", `/api/placemarks/${id}`);
  },

  async getAllPlacemarks() {
    return request("get", "/api/placemarks");
  },

  async deletePlacemark(id) {
    return request("delete", `/api/placemarks/${id}`);
  },

  async deleteUser(id) {
    return request("delete", `/api/users/${id}`);
  },

  async updateUser(id, updatedUser) {
    return request("put", `/api/users/${id}`, updatedUser);
  },

  async uploadImage(id, image) {
    const formData = new FormData();
    formData.append("imagefiles", image);
    const res = await axios.post(`${this.placemarkUrl}/api/placemarks/${id}/uploadimages`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
