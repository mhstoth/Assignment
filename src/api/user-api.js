import Boom from "@hapi/boom";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "../models/db.js";
import { UserSpec, UserSpecPlus, UserArraySpec, UserCredentialsSpec, IdSpec, JwtAuthSpec } from "../models/joi-schemas.js";
import { createToken } from "./jwt-utils.js";
import { emailService } from "../services/email-service.js";

const requireAdmin = (request, h) => {
  if (!request.auth?.credentials?.isAdmin) {
    throw Boom.forbidden("Admin privileges required");
  }
  return h.continue;
};

export const userApi = {

  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const email = request.payload.email.toLowerCase().trim();
        const user = await db.userStore.getUserByEmail(email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }
        if (!user.password) {
          return Boom.unauthorized("This account uses OAuth authentication. Please sign in with your OAuth provider.");
        }
        const isValidPassword = await bcrypt.compare(request.payload.password, user.password);
        if (!isValidPassword) {
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
        const userData = {
          ...request.payload,
          email: request.payload.email.toLowerCase().trim(),
          isAdmin: Boolean(request.payload.isAdmin),
        };
        const user = await db.userStore.addUser(userData);
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
    pre: [{ method: requireAdmin }],
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
    description: "Get all users (admin only)",
    notes: "Returns details of all users - requires admin JWT",
    response: { schema: UserArraySpec, failAction: "log" },
  },

  findOne: {
    auth: "jwt",
    pre: [{ method: requireAdmin }],
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
    description: "Get a specific user (admin only)",
    notes: "Returns user details - requires admin JWT",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
    response: { schema: UserSpec, failAction: "log" },
  },

  update: {
    auth: "jwt",
    pre: [{ method: requireAdmin }],
    handler: async function update(request, h) {
      try {
        const { isAdmin, ...userData } = request.payload;
        const user = await db.userStore.updateUserById(request.params.id, userData);
        if (user) {
          return user;
        }
        return Boom.notFound("User not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Update a user (admin only)",
    notes: "Updates user details - requires admin JWT",
    validate: { params: { id: IdSpec }, payload: UserSpecPlus, failAction: (request, h, err) => { throw err; } },
    response: { schema: UserSpec, failAction: "log" },
  },

  delete: {
    auth: "jwt",
    pre: [{ method: requireAdmin }],
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
    description: "Delete a specific user (admin only)",
    notes: "Deletes a user from the system - requires admin JWT",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
  },

  deleteAll: {
    auth: "jwt",
    pre: [{ method: requireAdmin }],
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
    description: "Delete all users (admin only)",
    notes: "Deletes all users from the system - requires admin JWT",
  },

  forgotPassword: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { email } = request.payload;
        const user = await db.userStore.getUserByEmail(email);

        if (!user) {
          return h.response({ message: "If an account with that email exists, we sent a link to reset your password." }).code(200);
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000;

        await db.userStore.updateUserById(user._id, {
          firstName: user.firstName,
          email: user.email,
          resetToken,
          resetTokenExpiry
        });

        await emailService.sendPasswordResetEmail(user.email, resetToken);

        return h.response({ message: "If an account with that email exists, we sent a link to reset your password." }).code(200);

      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Request password reset",
    notes: "Sends an email with reset token",
  },

  resetPassword: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { token, password } = request.payload;

        const user = await db.userStore.getUserByResetToken(token);
        if (!user) {
          return Boom.badRequest("Invalid or expired token");
        }

        if (user.resetTokenExpiry < Date.now()) {
          return Boom.badRequest("Token expired");
        }

        await db.userStore.updateUserById(user._id, {
          firstName: user.firstName,
          email: user.email,
          password: password,
          resetToken: null,
          resetTokenExpiry: null
        });

        return h.response({ message: "Password updated successfully" }).code(200);

      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Reset password",
    notes: "Updates password using valid token",
  }
}
