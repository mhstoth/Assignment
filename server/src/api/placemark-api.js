import Boom from "@hapi/boom";
import { db } from "../models/db.js";

export const placemarkApi = {
  create: {
    auth: false,
    handler: async function create(request, h) {
      try {
        const placemark = await db.placemarkStore.addPlacemark(request.payload);
        if (placemark) {
          return h.response(placemark).code(201);
        }
        return Boom.badImplementation("error creating placemark");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  find: {
    auth: false,
    handler: async function find(request, h) {
      try {
        const placemarks = await db.placemarkStore.getAllPlacemarks();
        if (placemarks) {
          return placemarks;
        }
        return Boom.notFound("Placemarks not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  findOne: {
    auth: false,
    handler: async function findOne(request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (placemark) {
          return placemark;
        }
        return Boom.notFound("Placemark not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  update: {
    auth: false,
    handler: async function update(request, h) {
      try {
        const placemark = await db.placemarkStore.updatePlacemarkById(request.params.id, request.payload);
        if (placemark) {
          return placemark;
        }
        return Boom.notFound("Placemark not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  delete: {
    auth: false,
    handler: async function deleteOne(request, h) {
      try {
        const placemark = await db.placemarkStore.deletePlacemarkById(request.params.id);
        if (placemark) {
          return h.response().code(204);
        }
        return Boom.notFound("Placemark not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },

  deleteAll: {
    auth: false,
    handler: async function deleteAll(request, h) {
      try {
        const placemarks = await db.placemarkStore.deleteAllPlacemarks();
        if (placemarks) {
          return h.response().code(204);
        }
        return Boom.notFound("Placemarks not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
  },
};
