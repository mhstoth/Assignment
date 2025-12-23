import { db } from "../models/db.js";
import { UserSpec } from "../models/joi-schemas.js";

export const accountsController = {
  index: {
    auth: false,
    handler: function index(request, h) {
      return h.view("main", { title: "Welcome to discoverRegensburg" });
    },
  },
  showSignup: {
    auth: false,
    handler: function showSignup(request, h) {
      return h.view("signup-view", { title: "Sign up for discoverRegensburg" });
    },
  },
  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      failAction: function failAction(request, h, error) {
        return h.view("signup-view", { title: "Sign up error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function signup(request, h) {
      const user = request.payload;
      user.email = user.email.toLowerCase();
      const newUser = await db.userStore.addUser(user);
      if (!newUser) {
        return h
          .view("signup-view", { title: "Sign up error", errors: [{ message: "Error creating user" }] })
          .takeover()
          .code(400);
      }
      return h.redirect("/");
    },
  },
  showLogin: {
    auth: false,
    handler: function showLogin(request, h) {
      return h.view("login-view", { title: "Login to discoverRegensburg" });
    },
  },
  login: {
    auth: false,
    handler: async function login(request, h) {
      const { email, password } = request.payload;
      const user = await db.userStore.getUserByEmail(email.toLowerCase());
      if (!user || user.password !== password) {
        return h.redirect("/");
      }
      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },

  logout: {
    handler: function logout(request, h) {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  async validate(request, session) {
    const user = await db.userStore.getUserById(session.id);
    if (!user) {
      return { isValid: false };
    }
    return { isValid: true, credentials: user };
  },
};
