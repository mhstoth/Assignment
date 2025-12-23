import { db } from "../models/db.js";
import { PlacemarkSpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";

const getDashboardViewData = async (request) => {
  const loggedInUser = request.auth.credentials;
  const placemarks = await db.placemarkStore.getUserPlacemarks(loggedInUser._id);
  const defaultCategories = ["Sightseeing", "Restaurants", "Bars", "Clubs"];
  const usedCategories = placemarks.map((p) => p.category);
  const allCategories = [...new Set([...defaultCategories, ...usedCategories])].sort();

  const groupedPlacemarks = allCategories
    .map((category) => ({
      category: category,
      items: placemarks.filter((p) => p.category === category),
    }))
    .filter((group) => group.items.length > 0);

  return {
    title: "Dashboard",
    groupedPlacemarks: groupedPlacemarks,
    categories: allCategories,
    isAdmin: loggedInUser.isAdmin,
  };
};

export const dashboardController = {
  index: {
    handler: async function index(request, h) {
      const viewData = await getDashboardViewData(request);
      return h.view("dashboard-view", viewData);
    },
  },

  addPlacemark: {
    handler: async function addPlacemark(request, h) {
      try {
        const loggedInUser = request.auth.credentials;
        const category = request.payload.customCategory || request.payload.selectedCategory || "General";

        const newPlacemark = {
          userid: loggedInUser._id,
          title: request.payload.title,
          latitude: Number(request.payload.latitude),
          longitude: Number(request.payload.longitude),
          category: category,
          description: request.payload.description,
        };

        const file = request.payload.imagefile;
        if (file && Object.keys(file).length > 0 && file._data && file._data.length > 0) {
          const url = await imageStore.uploadImage(file._data);
          newPlacemark.img = url;
        }

        const newPlacemarkObj = await db.placemarkStore.addPlacemark(newPlacemark);
        if (!newPlacemarkObj) {
          const viewData = await getDashboardViewData(request);
          viewData.title = "Add placemark error";
          viewData.errors = [{ message: "Error creating placemark" }];
          return h.view("dashboard-view", viewData).takeover().code(400);
        }
        return h.redirect("/dashboard");
      } catch (err) {
        console.log(err);
        const viewData = await getDashboardViewData(request);
        viewData.errors = [{ message: "Error creating placemark" }];
        return h.view("dashboard-view", viewData).takeover().code(400);
      }
    },
    payload: {
      multipart: true,
      output: "stream",
      parse: true,
      maxBytes: 209715200,
    },
  },

  updatePlacemarkById: {
    handler: async function updatePlacemarkById(request, h) {
      const { id } = request.params;
      const updatedPlacemark = request.payload;
      const updated = await db.placemarkStore.updatePlacemarkById(id, updatedPlacemark);
      return h.redirect("/dashboard");
    },
  },

  deleteAllUserPlacemarks: {
    handler: async function deleteAllUserPlacemarks(request, h) {
      const loggedInUser = request.auth.credentials;
      const userPlacemarks = await db.placemarkStore.getUserPlacemarks(loggedInUser._id);
      for (const placemark of userPlacemarks) {
        if (placemark.img) {
          await imageStore.deleteImage(placemark.img);
        }
        await db.placemarkStore.deletePlacemarkById(placemark._id);
      }
      return h.redirect("/dashboard");
    },
  },

  deleteAllPlacemarks: {
    handler: async function deleteAllPlacemarks(request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }
      const allPlacemarks = await db.placemarkStore.getAllPlacemarks();
      for (const placemark of allPlacemarks) {
        if (placemark.img) {
          await imageStore.deleteImage(placemark.img);
        }
      }
      await db.placemarkStore.deleteAllPlacemarks();
      return h.redirect("/dashboard");
    },
  },

  deletePlacemarkById: {
    handler: async function deletePlacemarkById(request, h) {
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      if (placemark) {
        if (placemark.img) {
          await imageStore.deleteImage(placemark.img);
        }
        await db.placemarkStore.deletePlacemarkById(placemark._id);
      }
      return h.redirect("/dashboard");
    },
  },

  uploadImage: {
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        const file = request.payload.imagefile;
        if (Object.keys(file).length > 0) {
          const url = await imageStore.uploadImage(request.payload.imagefile);
          await db.placemarkStore.updatePlacemarkById(placemark._id, { img: url });
        }
        return h.redirect("/dashboard");
      } catch (err) {
        console.log(err);
        return h.redirect("/dashboard");
      }
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
  },
};
