import { userApi } from "./api/user-api.js";
import { placemarkApi } from "./api/placemark-api.js";

export const apiRoutes = [
  { method: "POST", path: "/api/users", config: userApi.create },
  { method: "GET", path: "/api/users", config: userApi.find },
  { method: "GET", path: "/api/users/{id}", config: userApi.findOne },
  { method: "PUT", path: "/api/users/{id}", config: userApi.update },
  { method: "DELETE", path: "/api/users/{id}", config: userApi.delete },
  { method: "DELETE", path: "/api/users", config: userApi.deleteAll },
  { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },

  { method: "POST", path: "/api/placemarks", config: placemarkApi.create },
  { method: "POST", path: "/api/placemarks/{id}/uploadimage", config: placemarkApi.uploadImage },
  { method: "GET", path: "/api/placemarks", config: placemarkApi.find },
  { method: "GET", path: "/api/placemarks/{id}", config: placemarkApi.findOne },
  { method: "PUT", path: "/api/placemarks/{id}", config: placemarkApi.update },
  { method: "DELETE", path: "/api/placemarks/user", config: placemarkApi.deleteAllUserPlacemarks },
  { method: "DELETE", path: "/api/placemarks/{id}", config: placemarkApi.delete },
  { method: "DELETE", path: "/api/placemarks", config: placemarkApi.deleteAll },
];
