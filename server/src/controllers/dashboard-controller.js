import { db } from "../models/db.js";
import { PlacemarkSpec } from "../models/joi-schemas.js";

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
    validate: {
      payload: PlacemarkSpec,
      options: { abortEarly: false },
      failAction: async function failAction(request, h, error) {
        const placemarks = await db.placemarkStore.getAllPlacemarks();
        const viewData = {
          title: "Placemark Dashboard",
          placemarks: placemarks,
        };
        return h.view("dashboard-view", viewData).takeover().code(400);
      },
    },
    handler: async function addPlacemark(request, h) {
      const loggedInUser = request.auth.credentials;
      const category = request.payload.customCategory || request.payload.selectedCategory || "General";

      const newPlacemark = {
        userid: loggedInUser._id,
        title: request.payload.title,
        latitude: request.payload.latitude,
        longitude: request.payload.longitude,
        category: category,
        description: request.payload.description,
      };
      const newPlacemarkObj = await db.placemarkStore.addPlacemark(newPlacemark);
      if (!newPlacemarkObj) {
        const viewData = await getDashboardViewData(request);
        viewData.title = "Add placemark error";
        viewData.errors = [{ message: "Error creating placemark" }];
        return h.view("dashboard-view", viewData).takeover().code(400);
      }
      return h.redirect("/dashboard");
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

  deleteAllPlacemarks: {
    handler: async function deleteAllPlacemarks(request, h) {
      await db.placemarkStore.deleteAllPlacemarks();
      return h.redirect("/dashboard");
    },
  },

  deletePlacemarkById: {
    handler: async function deletePlacemarkById(request, h) {
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      if (placemark) {
        await db.placemarkStore.deletePlacemarkById(placemark._id);
      }
      return h.redirect("/dashboard");
    },
  },
};
