import Mongoose from "mongoose";

const { Schema } = Mongoose;

const placemarkSchema = new Schema({
  title: String,
  userid: String,
  category: String,
  description: String,
  img: String,
  latitude: {
    type: Number,
    min: -90,
    max: 90,
    required: true,
    validate: {
      validator: Number.isFinite,
      message: "Latitude must be finite number",
    },
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
    validate: {
      validator: Number.isFinite,
      message: "Longitude must be a finite number"

    },
  },
});

export const Placemark = Mongoose.model("Placemark", placemarkSchema);
