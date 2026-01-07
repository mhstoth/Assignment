import Boom from "@hapi/boom";
import Joi from "joi";

export const imageSearchApi = {
  search: {
    auth: "jwt",
    handler: async function (request, h) {
      try {
        const { query, page = 1, perPage = 20 } = request.query;

        const apiUrl = `https://api.openverse.org/v1/images/`;
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          page_size: perPage.toString(),
          license_type: "commercial,modification",
        });

        const response = await fetch(`${apiUrl}?${params.toString()}`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.error("Openverse API HTTP error:", response.status);
          return Boom.badGateway("Openverse API unavailable");
        }

        const data = await response.json();

        const images = (data.results || []).map((img) => ({
          id: img.id,
          url: img.url,
          thumbnail: img.thumbnail || img.url,
          title: img.title || "Untitled",
          creator: img.creator || "Unknown",
          license: img.license || "CC",
        }));

        return {
          images,
          total: data.result_count || 0,
          page: parseInt(page),
          perPage: parseInt(perPage),
        };
      } catch (err) {
        console.error("Openverse API error:", err);
        return Boom.badImplementation("Error searching images");
      }
    },
    tags: ["api"],
    description: "Search for CC-licensed images via Openverse",
    notes: "Returns Creative Commons licensed images that can be used for placemarks",
    validate: {
      query: Joi.object({
        query: Joi.string().required().min(1).description("Search query"),
        page: Joi.number().integer().min(1).default(1).description("Page number"),
        perPage: Joi.number().integer().min(1).max(50).default(20).description("Results per page"),
      }),
      failAction: (request, h, err) => {
        throw err;
      },
    },
  },
};
