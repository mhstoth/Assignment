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
});

export const User = Mongoose.model("User", userSchema);