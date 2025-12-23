import axios from "axios";
import { serviceUrl } from "./fixtures.js";

export const placemarkService = {
  placemarkUrl: serviceUrl,

  async authenticate(user) {
    const response = await axios.post(`${this.placemarkUrl}/api/users/authenticate`, { email: user.email, password: user.password });
    axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
    return response.data;
  },

  async clearAuth() {
    axios.defaults.headers.common["Authorization"] = "";
  },

  async createUser(user) {
    const res = await axios.post(`${this.placemarkUrl}/api/users`, user);
    return res.data;
  },

  async getUser(id) {
    const res = await axios.get(`${this.placemarkUrl}/api/users/${id}`);
    return res.data;
  },

  async getAllUsers() {
    const res = await axios.get(`${this.placemarkUrl}/api/users`);
    return res.data;
  },

  async deleteAllUsers() {
    const res = await axios.delete(`${this.placemarkUrl}/api/users`);
    return res.data;
  },

  async createPlacemark(placemark) {
    const res = await axios.post(`${this.placemarkUrl}/api/placemarks`, placemark);
    return res.data;
  },

  async deleteAllPlacemarks() {
    const res = await axios.delete(`${this.placemarkUrl}/api/placemarks`);
    return res.data;
  },

  async deleteAllUserPlacemarks() {
    const res = await axios.delete(`${this.placemarkUrl}/api/placemarks/user`);
    return res.data;
  },

  async getPlacemark(id) {
    const res = await axios.get(`${this.placemarkUrl}/api/placemarks/${id}`);
    return res.data;
  },

  async getAllPlacemarks() {
    const res = await axios.get(`${this.placemarkUrl}/api/placemarks`);
    return res.data;
  },

  async deletePlacemark(id) {
    const res = await axios.delete(`${this.placemarkUrl}/api/placemarks/${id}`);
    return res.data;
  },

  async deleteUser(id) {
    const res = await axios.delete(`${this.placemarkUrl}/api/users/${id}`);
    return res.data;
  },

  async updateUser(id, updatedUser) {
    const res = await axios.put(`${this.placemarkUrl}/api/users/${id}`, updatedUser);
    return res.data;
  },

  async uploadImage(id, image) {
    const formData = new FormData();
    formData.append("imagefile", image);
    const res = await axios.post(`${this.placemarkUrl}/api/placemarks/${id}/uploadimage`, formData);
    return res.data;
  },
};
