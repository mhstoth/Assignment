import Joi from "joi";

export const UserSpec = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
};

export const PlacemarkSpec = {
  title: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  selectedCategory: Joi.string().allow("").optional(),
  customCategory: Joi.string().allow("").optional(),
  description: Joi.string().required(),
};
