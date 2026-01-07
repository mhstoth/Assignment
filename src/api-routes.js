import { userApi } from "./api/user-api.js";
import { placemarkApi } from "./api/placemark-api.js";
import { oauthApi } from "./api/oauth-api.js";
import { imageSearchApi } from "./api/image-search-api.js";

export const apiRoutes = [
  { method: "POST", path: "/api/users", config: userApi.create },
  { method: "GET", path: "/api/users", config: userApi.find },
  { method: "GET", path: "/api/users/{id}", config: userApi.findOne },
  { method: "PUT", path: "/api/users/{id}", config: userApi.update },
  { method: "DELETE", path: "/api/users/{id}", config: userApi.delete },
  { method: "DELETE", path: "/api/users", config: userApi.deleteAll },
  { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },
  { method: "POST", path: "/api/users/forgot-password", config: userApi.forgotPassword },
  { method: "POST", path: "/api/users/reset-password", config: userApi.resetPassword },

  { method: "GET", path: "/api/auth/github", config: oauthApi.githubInit },
  { method: "GET", path: "/api/auth/github/callback", config: oauthApi.githubCallback },
  { method: "GET", path: "/api/auth/google", config: oauthApi.googleInit },
  { method: "GET", path: "/api/auth/google/callback", config: oauthApi.googleCallback },

  { method: "GET", path: "/api/images/search", config: imageSearchApi.search },

  { method: "POST", path: "/api/placemarks", config: placemarkApi.create },
  { method: "POST", path: "/api/placemarks/{id}/uploadimages", config: placemarkApi.uploadImages },
  { method: "DELETE", path: "/api/placemarks/{id}/images/{imageUrl}", config: placemarkApi.deleteImage },
  { method: "GET", path: "/api/placemarks", config: placemarkApi.find },
  { method: "GET", path: "/api/placemarks/admin/all", config: placemarkApi.findAllForAdmin },
  { method: "GET", path: "/api/placemarks/{id}", config: placemarkApi.findOne },
  { method: "PUT", path: "/api/placemarks/{id}", config: placemarkApi.update },
  { method: "DELETE", path: "/api/placemarks/user", config: placemarkApi.deleteAllUserPlacemarks },
  { method: "DELETE", path: "/api/placemarks/{id}", config: placemarkApi.delete },
  { method: "DELETE", path: "/api/placemarks", config: placemarkApi.deleteAll },
];

