import { userJsonStore } from "./json/user-json-store.js";
import { placemarkJsonStore } from "./json/placemark-json-store.js";

export const db = {
  userStore: null,
  placemarkStore: null,

  init() {
    this.userStore = userJsonStore;
    this.placemarkStore = placemarkJsonStore;
  },
};
