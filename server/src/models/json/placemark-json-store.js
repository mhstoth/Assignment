import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const placemarkJsonStore = {
  async getAllPlacemarks() {
    await db.read();
    return db.data.placemarks;
  },
  async addPlacemark(placemark) {
    if (!placemark.title || !placemark.category || !placemark.latitude || !placemark.longitude) {
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

    await db.read();
    placemark._id = v4();
    db.data.placemarks.push(placemark);
    await db.write();
    return placemark;
  },
  async getPlacemarkById(id) {
    await db.read();
    return db.data.placemarks.find((placemark) => placemark._id === id);
  },
  async getUserPlacemarks(userId) {
    await db.read();
    return db.data.placemarks.filter((placemark) => placemark.userid === userId);
  },

  async updatePlacemarkById(id, updatedData) {
    await db.read();
    const index = db.data.placemarks.findIndex((placemark) => placemark._id === id);
    if (index !== -1) {
      db.data.placemarks[index] = { ...db.data.placemarks[index], ...updatedData };
      await db.write();
      return db.data.placemarks[index];
    }
    return null;
  },

  async deleteAllPlacemarks() {
    db.data.placemarks = [];
    await db.write();
    return true;
  },

  async deletePlacemarkById(id) {
    await db.read();
    const index = db.data.placemarks.findIndex((placemark) => placemark._id === id);
    if (index !== -1) {
      db.data.placemarks.splice(index, 1);
      await db.write();
      return true;
    }
    return null;
  },
};
