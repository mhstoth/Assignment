import { dashboardController } from "./controllers/dashboard-controller.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { adminController } from "./controllers/admin-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "POST", path: "/authenticate", config: accountsController.login },
  { method: "GET", path: "/logout", config: accountsController.logout },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "POST", path: "/dashboard/addplacemark", config: dashboardController.addPlacemark },
  { method: "POST", path: "/dashboard/deletealluserplacemarks", config: dashboardController.deleteAllUserPlacemarks },
  { method: "POST", path: "/dashboard/deleteallplacemarks", config: dashboardController.deleteAllPlacemarks },
  { method: "POST", path: "/dashboard/deleteplacemark/{id}", config: dashboardController.deletePlacemarkById },
  { method: "POST", path: "/dashboard/updateplacemark/{id}", config: dashboardController.updatePlacemarkById },
  { method: "POST", path: "/dashboard/{id}/uploadimage", config: dashboardController.uploadImage },

  { method: "GET", path: "/admin", config: adminController.index },
  { method: "POST", path: "/admin/deleteuser/{id}", config: adminController.deleteUser },
  { method: "POST", path: "/admin/deleteallusers", config: adminController.deleteAllUsers },

  { method: "GET", path: "/{param}", handler: { directory: { path: "./public" } }, options: { auth: false } },
];
