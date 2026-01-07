import Mongoose from "mongoose";

const { Schema } = Mongoose;

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  oauthProvider: String,
  oauthId: String,
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
});

export const User = Mongoose.model("User", userSchema);