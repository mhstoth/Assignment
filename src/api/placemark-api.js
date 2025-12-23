import Joi from "joi";
import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { PlacemarkSpec, PlacemarkSpecPlus, PlacemarkArraySpec, IdSpec } from "../models/joi-schemas.js";

export const placemarkApi = {
  create: {
    auth: "jwt",
    handler: async function create(request, h) {
      try {
        const newPlacemark = request.payload;
        newPlacemark.userid = request.auth.credentials._id;
        const placemark = await db.placemarkStore.addPlacemark(newPlacemark);
        if (placemark) {
          return h.response(placemark).code(201);
        }
        return Boom.badImplementation("error creating placemark");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a Placemark",
    notes: "Returns a newly created placemark",
    validate: { payload: PlacemarkSpecPlus, failAction: (request, h, err) => { throw err; } },
    response: { schema: PlacemarkSpec, failAction: "log" },
  },

  find: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Get all placemarks",
    notes: "Returns details of all placemarks",
    response: { schema: PlacemarkArraySpec, failAction: "log" },
  },

  findOne: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Get a specific placemark",
    notes: "Returns placemark details",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
    response: { schema: PlacemarkSpec, failAction: "log" },
  },

  update: {
    auth: "jwt",
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
    tags: ["api"],
    description: "Update a placemark",
    notes: "Updates placemark details",
    validate: { params: { id: IdSpec }, payload: PlacemarkSpecPlus, failAction: (request, h, err) => { throw err; } },
    response: { schema: PlacemarkSpec, failAction: "log" },
  },

  delete: {
    auth: "jwt",
    handler: async function deleteOne(request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (placemark) {
          if (placemark.img) {
            await imageStore.deleteImage(placemark.img);
          }
          await db.placemarkStore.deletePlacemarkById(placemark._id);
          return h.response().code(204);
        }
        return Boom.notFound("Placemark not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a specific placemark",
    notes: "Deletes a placemark from the system",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
  },

  deleteAllUserPlacemarks: {
    auth: "jwt",
    handler: async function deleteAllUserPlacemarks(request, h) {
      try {
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const userPlacemarks =
          (await db.placemarkStore.getUserPlacemarks(userId)) || [];

        await Promise.all(
          userPlacemarks.map(async placemark => {
            if (placemark.img) {
              try {
                await imageStore.deleteImage(placemark.img);
              } catch (err) {
                console.log("Image delete failed:", err);
              }
            }
            await db.placemarkStore.deletePlacemarkById(placemark._id);
          })
        );

        return h.response().code(204);
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all placemarks of the authenticated user",
    notes: "Deletes all placemarks belonging to the currently authenticated user"
  },

  deleteAll: {
    auth: "jwt",
    handler: async function deleteAll(request, h) {
      try {
        const placemarks =
          (await db.placemarkStore.getAllPlacemarks()) || [];

        await Promise.all(
          placemarks.map(async placemark => {
            if (placemark.img) {
              try {
                await imageStore.deleteImage(placemark.img);
              } catch (err) {
                console.log("Image delete failed:", err);
              }
            }
          })
        );

        await db.placemarkStore.deleteAllPlacemarks();

        return h.response().code(204);
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all placemarks",
    notes: "Deletes all placemarks from the system"
  },

  uploadImage: {
    auth: "jwt",
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("Placemark not found");
        }
        const file = request.payload.imagefile;
        if (file && Object.keys(file).length > 0) {
          const url = await imageStore.uploadImage(request.payload.imagefile);
          placemark.img = url;
          await db.placemarkStore.updatePlacemarkById(placemark._id, placemark);
          return h.response(placemark).code(201);
        }
        return Boom.badRequest("No image provided");
      } catch (err) {
        console.error("Upload failed:", err);
        return Boom.badImplementation("error uploading image");
      }
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
    tags: ["api"],
    description: "Upload an image to a placemark",
    notes: "Uploads an image file to Cloudinary and links it to the placemark",
    plugins: {
      "hapi-swagger": { payloadType: "form" },
    },
    validate: {
      params: { id: IdSpec },
      payload: Joi.object({
        imagefile: Joi.any().meta({ swaggerType: "file" }).description("file to upload").required(),
      }),
      failAction: (request, h, err) => { throw err; }
    },
  },
};
