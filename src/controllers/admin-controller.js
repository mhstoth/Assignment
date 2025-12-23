import { db } from "../models/db.js";


export const adminController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }
      const users = await db.userStore.getAllUsers();
      return h.view("admin-view", {
        title: "Admin Dashboard",
        users: users,
        isAdmin: loggedInUser.isAdmin,
      });
    },
  },

  deleteUser: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }
      const userId = request.params.id;
      await db.userStore.deleteUserById(userId);
      return h.redirect("/admin");
    },
  },

  deleteAllUsers: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }
      await db.userStore.deleteAllUsers();
      return h.redirect("/admin");
    },
  },
}