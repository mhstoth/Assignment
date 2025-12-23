import * as cloudinary from "cloudinary";
import { writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
};

  cloudinary.v2.config(credentials);

export const imageStore = {
  getAllImages: async function () {
    const result = await cloudinary.v2.api.resources();
    return result.resources;
  },

  uploadImage: async function (imagefile) {
    writeFileSync("./public/temp.img", imagefile);
    const response = await cloudinary.v2.uploader.upload("./public/temp.img");
    return response.url;
  },

  deleteImage: async function (img) {
    if (img && img.includes("cloudinary.com")) {
      const parts = img.split("/");
      const lastPart = parts.pop();
      const publicId = lastPart.split(".")[0];
      await cloudinary.v2.uploader.destroy(publicId, {});
    }
  },
};
