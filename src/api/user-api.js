import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { UserSpec, UserSpecPlus, UserArraySpec, UserCredentialsSpec, IdSpec, JwtAuthSpec } from "../models/joi-schemas.js";
import { createToken } from "./jwt-utils.js";

export const userApi = {

  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }
        if (user.password !== request.payload.password) {
          return Boom.unauthorized("Invalid password");
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "Returns a JWT token if authentication succeeds",
    validate: { payload: UserCredentialsSpec, failAction: (request, h, err) => { throw err; } },
    response: { schema: JwtAuthSpec, failAction: "log" },
  },

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
    tags: ["api"],
    description: "Create a User",
    notes: "Returns a newly created user",
    validate: { payload: UserSpecPlus, failAction: (request, h, err) => { throw err; } },
    response: { schema: UserSpec, failAction: "log" },
  },

  find: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Get all users",
    notes: "Returns details of all users",
    response: { schema: UserArraySpec, failAction: "log" },
  },

  findOne: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Get a specific user",
    notes: "Returns user details",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
    response: { schema: UserSpec, failAction: "log" },
  },

  update: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Update a user",
    notes: "Updates user details",
    validate: { params: { id: IdSpec }, payload: UserSpecPlus, failAction: (request, h, err) => { throw err; } },
    response: { schema: UserSpec, failAction: "log" },
  },

  delete: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Delete a specific user",
    notes: "Deletes a user from the system",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
  },

  deleteAll: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Delete all users",
    notes: "Deletes all users from the system (Admin access suggested)",
  },
}
