import Mongoose from "mongoose";
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
    if (!user.firstName || !user.lastName || !user.email || !user.password) {
      return null;
    }
    const newUser = new User(user);
    const userObj = await newUser.save();
    const u = await this.getUserById(userObj._id);
    return u;
  },

  async getUserByEmail(email) {
    if (!email) {
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return null;
    }
    const user = await User.findOne({ email: email }).lean();
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
    const user = await User.findOneAndUpdate({ _id: id }, updatedUser, { new: true }).lean();
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
