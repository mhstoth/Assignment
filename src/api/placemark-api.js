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
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const placemarks = await db.placemarkStore.getUserPlacemarks(userId);
        if (placemarks) {
          return placemarks;
        }
        return Boom.notFound("Placemarks not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all placemarks for the authenticated user",
    notes: "Returns details of all placemarks belonging to the authenticated user",
    response: { schema: PlacemarkArraySpec, failAction: "log" },
  },

  findAllForAdmin: {
    auth: "jwt",
    handler: async function findAllForAdmin(request, h) {
      try {
        const isAdmin = request.auth.credentials?.isAdmin === true;
        if (!isAdmin) {
          return Boom.forbidden("Admin privileges required");
        }
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
    description: "Get all placemarks (admin only)",
    notes: "Returns all placemarks in the system - requires admin JWT",
    response: { schema: PlacemarkArraySpec, failAction: "log" },
  },

  findOne: {
    auth: "jwt",
    handler: async function findOne(request, h) {
      try {
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (placemark) {
          if (placemark.userid?.toString() !== userId) {
            return Boom.forbidden("You can only access your own placemarks");
          }
          return placemark;
        }
        return Boom.notFound("Placemark not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Get a specific placemark",
    notes: "Returns placemark details - only if owned by the authenticated user",
    validate: { params: { id: IdSpec }, failAction: (request, h, err) => { throw err; } },
    response: { schema: PlacemarkSpec, failAction: "log" },
  },

  update: {
    auth: "jwt",
    handler: async function update(request, h) {
      try {
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("Placemark not found");
        }
        if (placemark.userid?.toString() !== userId) {
          return Boom.forbidden("You can only update your own placemarks");
        }
        const updatedPlacemark = await db.placemarkStore.updatePlacemarkById(request.params.id, request.payload);
        if (updatedPlacemark) {
          return updatedPlacemark;
        }
        return Boom.notFound("Placemark not found");
      } catch (error) {
        return Boom.badRequest("Database Error");
      }
    },
    tags: ["api"],
    description: "Update a placemark",
    notes: "Updates placemark details - only if owned by the authenticated user",
    validate: { params: { id: IdSpec }, payload: PlacemarkSpecPlus, failAction: (request, h, err) => { throw err; } },
    response: { schema: PlacemarkSpec, failAction: "log" },
  },

  delete: {
    auth: "jwt",
    handler: async function deleteOne(request, h) {
      try {
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (placemark) {
          if (placemark.userid?.toString() !== userId) {
            return Boom.forbidden("You can only delete your own placemarks");
          }
          if (placemark.images && placemark.images.length > 0) {
            await Promise.all(
              placemark.images.map(img => imageStore.deleteImage(img).catch(err => console.log("Image delete failed:", err)))
            );
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
    notes: "Deletes a placemark from the system - only if owned by the authenticated user",
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
            if (placemark.images && placemark.images.length > 0) {
              await Promise.all(
                placemark.images.map(img => imageStore.deleteImage(img).catch(err => console.log("Image delete failed:", err)))
              );
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
            if (placemark.images && placemark.images.length > 0) {
              await Promise.all(
                placemark.images.map(img => imageStore.deleteImage(img).catch(err => console.log("Image delete failed:", err)))
              );
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

  uploadImages: {
    auth: "jwt",
    handler: async function (request, h) {
      try {
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("Placemark not found");
        }
        if (placemark.userid?.toString() !== userId) {
          return Boom.forbidden("You can only upload images to your own placemarks");
        }

        let files = [];
        if (Array.isArray(request.payload.imagefiles)) {
          files = request.payload.imagefiles;
        } else if (request.payload.imagefiles) {
          files = [request.payload.imagefiles];
        }

        if (files.length === 0) {
          return Boom.badRequest("No images provided");
        }

        const urls = [];
        for (const file of files) {
          if (file && Object.keys(file).length > 0) {
            const buffer = file._data || file;
            const url = await imageStore.uploadImage(buffer);
            urls.push(url);
          }
        }

        if (!placemark.images) {
          placemark.images = [];
        }
        placemark.images = [...placemark.images, ...urls];

        await db.placemarkStore.updatePlacemarkById(placemark._id, placemark);
        return h.response(placemark).code(201);
      } catch (err) {
        console.error("Upload failed:", err);
        return Boom.badImplementation("error uploading images");
      }
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
    tags: ["api"],
    description: "Upload multiple images to a placemark",
    notes: "Uploads multiple image files to Cloudinary and adds them to the placemark's images array",
    plugins: {
      "hapi-swagger": { payloadType: "form" },
    },
    validate: {
      params: { id: IdSpec },
      payload: Joi.object({
        imagefiles: Joi.alternatives().try(
          Joi.array().items(Joi.any().meta({ swaggerType: "file" })),
          Joi.any().meta({ swaggerType: "file" })
        ).description("files to upload").required(),
      }),
      failAction: (request, h, err) => { throw err; }
    },
  },

  deleteImage: {
    auth: "jwt",
    handler: async function (request, h) {
      try {
        const userId = request.auth.credentials?._id?.toString();
        if (!userId) {
          return Boom.unauthorized("User not authenticated");
        }
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("Placemark not found");
        }
        if (placemark.userid?.toString() !== userId) {
          return Boom.forbidden("You can only delete images from your own placemarks");
        }

        const imageUrl = decodeURIComponent(request.params.imageUrl);

        if (!placemark.images || !placemark.images.includes(imageUrl)) {
          return Boom.notFound("Image not found in placemark");
        }

        placemark.images = placemark.images.filter(img => img !== imageUrl);

        await imageStore.deleteImage(imageUrl).catch(err => {
          console.log("Cloudinary delete failed:", err);
        });

        await db.placemarkStore.updatePlacemarkById(placemark._id, placemark);
        return h.response(placemark).code(200);
      } catch (err) {
        console.error("Delete image failed:", err);
        return Boom.badImplementation("error deleting image");
      }
    },
    tags: ["api"],
    description: "Delete a specific image from a placemark",
    notes: "Removes an image URL from the placemark's images array and deletes it from Cloudinary",
    validate: {
      params: Joi.object({
        id: IdSpec,
        imageUrl: Joi.string().required(),
      }),
      failAction: (request, h, err) => { throw err; }
    },
  },
};
