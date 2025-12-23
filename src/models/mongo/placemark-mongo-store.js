import Mongoose from "mongoose";
import { Placemark } from "./placemark.js";

export const placemarkMongoStore = {
  async getAllPlacemarks() {
    const placemarks = await Placemark.find().lean();
    return placemarks;
  },

  async addPlacemark(placemark) {
    if (!placemark.title || !placemark.category || placemark.latitude === undefined || placemark.longitude === undefined) {
      return null;
    }
    if (placemark.title.trim().length === 0) {
      return null;
    }
    if (placemark.latitude < -90 || placemark.latitude > 90) {
      return null;
    }
    if (placemark.longitude < -180 || placemark.longitude > 180) {
      return null;
    }
    const newPlacemark = new Placemark(placemark);
    const placemarkObj = await newPlacemark.save();
    const p = await this.getPlacemarkById(placemarkObj._id);
    return p;
  },

  async getPlacemarkById(id) {
    if (!Mongoose.isValidObjectId(id)) {
      return undefined;
    }
    const placemark = await Placemark.findOne({ _id: id }).lean();
    return placemark ?? undefined;
  },

  async getUserPlacemarks(userId) {
    if (!userId) {
      return [];
    }
    const placemarks = await Placemark.find({ userid: userId }).lean();
    return placemarks;
  },

  async updatePlacemarkById(id, updatedData) {
    if (!Mongoose.isValidObjectId(id)) {
      return null;
    }
    const placemark = await Placemark.findOneAndUpdate({ _id: id }, updatedData, { new: true }).lean();
    return placemark ?? null;
  },

  async deleteAllPlacemarks() {
    await Placemark.deleteMany({});
    return true;
  },

  async deletePlacemarkById(id) {
    if (!Mongoose.isValidObjectId(id)) {
      return null;
    }
    const result = await Placemark.deleteOne({ _id: id });
    return result.deletedCount === 1 ? true : null;
  },

  async deleteAll() {
    return this.deleteAllPlacemarks();
  },
};
