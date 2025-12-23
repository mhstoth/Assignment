import * as dotenv from "dotenv";
import Mongoose from "mongoose";
import * as mongooseSeeder from "mais-mongoose-seeder";
import { seedData } from "./seed-data.js";

const seedLib = mongooseSeeder.default;
dotenv.config();


async function seed() {
  const seeder = seedLib(Mongoose);
  const dbData = await seeder.seed(seedData, { DropDatabase: false, dropCollections: true });
  console.log(dbData);
}

export function connectMongo() {

  const mongoUrl = process.env.DB || process.env.db;
  if (!mongoUrl) {
    return Promise.reject(new Error("Database connection error: missing DB env var"));
  }

  if (Mongoose.connection.readyState !== 0) {
    return Promise.resolve(Mongoose.connection);
  }

  Mongoose.set("strictQuery", true);
  const connectPromise = Mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
  const db = Mongoose.connection;

  db.on("error", (err) => {
    console.log(`Database connection error: ${err}`);
  });

  db.on("disconnected", () => {
    console.log("database disconnected");
  });

  db.once("open", () => {
    console.log(`Database connected to ${db.name} on ${db.host}`);
    seed();
  });

  return connectPromise;
}
