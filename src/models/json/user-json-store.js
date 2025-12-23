import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const userJsonStore = {
  async getAllUsers() {
    await db.read();
    return db.data.users;
  },

  async addUser(user) {
    if (!user.firstName || !user.lastName || !user.email || !user.password) {
      return null;
    }
    await db.read();
    const newUser = { ...user, _id: v4() };
    db.data.users.push(newUser);
    await db.write();
    return newUser;
  },

  async getUserById(id) {
    await db.read();
    return db.data.users.find((user) => user._id === id);
  },

  async getUserByEmail(email) {
    if (!email) {
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return null;
    }
    await db.read();
    const { users } = db.data;
    const u = users.find((user) => user.email === email);
    return u;
  },

  async deleteUserById(id) {
    await db.read();
    const index = db.data.users.findIndex((user) => user._id === id);
    if (index === -1) return null;
    db.data.users.splice(index, 1);
    await db.write();
    return true;
  },

  async updateUser(id, updatedUser) {
    await db.read();
    const user = db.data.users.find((u) => u._id === id);
    if (!user) {
      return null;
    }
    user.firstName = updatedUser.firstName;
    user.lastName = updatedUser.lastName;
    user.email = updatedUser.email;
    user.password = updatedUser.password;
    await db.write();
    return user;
  },

  async deleteAllUsers() {
    db.data.users = [];
    await db.write();
    return true;
  },
};
