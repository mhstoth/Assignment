import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserSpec = Joi.object()
  .keys({
    firstName: Joi.string().example("Max").description("the first name of the user").required(),
    lastName: Joi.string().example("Mustermann").description("the last name of the user").required(),
    email: Joi.string().email().example("max@mustermann.com").description("the email of the user").required(),
    password: Joi.string().example("secret").description("the password of the user").required(),
    isAdmin: Joi.boolean().example(false).description("is the user an admin").optional(),
    _id: IdSpec,
    __v: Joi.number(),
  })
  .label("UserDetails");

export const UserSpecPlus = Joi.object()
  .keys({
    firstName: Joi.string().example("Max").description("the first name of the user").required(),
    lastName: Joi.string().example("Mustermann").description("the last name of the user").required(),
    email: Joi.string().email().example("max@mustermann.com").description("the email of the user").required(),
    password: Joi.string().example("secret").description("the password of the user").required(),
    isAdmin: Joi.boolean().example(false).description("is the user an admin").optional(),
  })
  .label("UserDetailsPlus");

export const UserArraySpec = Joi.array().items(UserSpec).label("UserArray");

export const UserCredentialsSpec = Joi.object()
  .keys({
    email: Joi.string().email().example("max@mustermann.com").description("the email of the user").required(),
    password: Joi.string().example("secret").description("the password of the user").required(),
  })
  .label("UserCredentials");

export const JwtAuthSpec = Joi.object()
  .keys({
    success: Joi.boolean().example(true).required(),
    token: Joi.string().example("pkY9S7BaDN83v919...").required(),
  })
  .label("JwtAuth");

export const PlacemarkSpec = Joi.object()
  .keys({
    title: Joi.string().example("Steinerne Brücke").description("the title of the placemark").required(),
    latitude: Joi.number().min(-90).max(90).example(49.0225).description("the latitude").required(),
    longitude: Joi.number().min(-180).max(180).example(12.0969).description("the longitude").required(),
    category: Joi.string().example("Sightseeing").description("the category").required(),
    description: Joi.string().example("Old bridge").description("the description").required(),
    img: Joi.string().example("url").description("image url").optional(),
    userid: IdSpec,
    _id: IdSpec,
    __v: Joi.number(),
  })
  .label("PlacemarkDetails");

export const PlacemarkSpecPlus = Joi.object()
  .keys({
    title: Joi.string().example("Steinerne Brücke").description("the title of the placemark").required(),
    latitude: Joi.number().min(-90).max(90).example(49.0225).description("the latitude").required(),
    longitude: Joi.number().min(-180).max(180).example(12.0969).description("the longitude").required(),
    category: Joi.string().example("Sightseeing").description("the category").required(),
    description: Joi.string().example("Old bridge").description("the description").required(),
    img: Joi.string().example("url").description("image url").optional(),
  })
  .label("PlacemarkDetailsPlus");

export const PlacemarkArraySpec = Joi.array().items(PlacemarkSpec).label("PlacemarkArray");
