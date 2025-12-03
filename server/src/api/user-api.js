import Boom from "@hapi/boom";
import { db } from "../models/db.js";

export const userApi = {
  create: {
    auth: false,
    handler: async function create(request, h) {
      try {
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          return h.response(user).code(201);
        }
        return Boom.badImplementation("error creating user");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  find: {
    auth: false,
    handler: async function find(request, h) {
      try {
        const users = await db.userStore.getAllUsers();
        if (users) {
          return users;
        }
        return Boom.notFound("Users not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  findOne: {
    auth: false,
    handler: async function findOne(request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (user) {
          return user;
        }
        return Boom.notFound("User not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  update: {
    auth: false,
    handler: async function update(request, h) {
      try {
        const user = await db.userStore.updateUserById(request.params.id, request.payload);
        if (user) {
          return user;
        }
        return Boom.notFound("User not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  delete: {
    auth: false,
    handler: async function deleteOne(request, h) {
      try {
        const user = await db.userStore.deleteUserById(request.params.id);
        if (user) {
          return h.response().code(204);
        }
        return Boom.notFound("User not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  deleteAll: {
    auth: false,
    handler: async function deleteAll(request, h) {
      try {
        const users = await db.userStore.deleteAllUsers();
        if (users) {
          return h.response().code(204);
        }
        return Boom.notFound("Users not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },
};
