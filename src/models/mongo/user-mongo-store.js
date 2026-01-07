import Mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./user.js";

export const userMongoStore = {
  async getAllUsers() {
    const users = await User.find().lean();
    return users;
  },

  async getUserById(id) {
    if (!Mongoose.isValidObjectId(id)) {
      return undefined;
    }
    const user = await User.findOne({ _id: id }).lean();
    return user ?? undefined;
  },

  async addUser(user) {
    if (!user.firstName || !user.email) {
      return null;
    }
    if (!user.password && !user.oauthProvider) {
      return null;
    }
    const normalizedEmail = user.email.toLowerCase();
    const userData = {
      ...user,
      email: normalizedEmail,
      isAdmin: Boolean(user.isAdmin),
    };
    if (user.password) {
      userData.password = await bcrypt.hash(user.password, 10);
    } else {
      userData.password = null;
    }
    const newUser = new User(userData);
    const userObj = await newUser.save();
    const u = await this.getUserById(userObj._id);
    return u;
  },

  async getUserByEmail(email) {
    if (!email) {
      return null;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return null;
    }
    const user = await User.findOne({ email: normalizedEmail }).lean();
    return user;
  },

  async getUserByOAuthId(provider, oauthId) {
    if (!provider || !oauthId) {
      return null;
    }
    const user = await User.findOne({ oauthProvider: provider, oauthId: oauthId.toString() }).lean();
    return user;
  },

  async getUserByResetToken(token) {
    const user = await User.findOne({ resetToken: token }).lean();
    return user;
  },

  async deleteUserById(id) {
    try {
      await User.deleteOne({ _id: id });
      return true;
    } catch (error) {
      console.log("bad id");
      return null;
    }
  },

  async updateUserById(id, updatedUser) {
    if (!Mongoose.isValidObjectId(id)) {
      return null;
    }
    const { isAdmin, ...userData } = updatedUser;

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = await User.findOneAndUpdate({ _id: id }, userData, { new: true }).lean();
    return user ?? null;
  },

  async deleteAllUsers() {
    await User.deleteMany({});
    return true;
  },

  async deleteAll() {
    return this.deleteAllUsers();
  },
};
