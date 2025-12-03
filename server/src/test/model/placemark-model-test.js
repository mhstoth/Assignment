import { assert } from "chai";
import { db } from "../../models/db.js";
import { users, placemarks } from "../fixtures.js";

suite("Placemark Model tests", () => {
  setup(async () => {
    db.init();
    await db.placemarkStore.deleteAllPlacemarks();
    await db.userStore.deleteAllUsers();
    const user = await db.userStore.addUser(users.moritz);
    const promises = [];
    for (let i = 0; i < 5; i += 1) {
      promises.push(db.placemarkStore.addPlacemark({ ...placemarks.sightseeing }));
    }
    await Promise.all(promises);
  });

  test("create a placemark | succeed", async () => {
    const newPlacemark = await db.placemarkStore.addPlacemark({ ...placemarks.sightseeing });
    assert.isNotNull(newPlacemark._id);
  });

  test("get placemark by id | succeed", async () => {
    const newPlacemark = await db.placemarkStore.addPlacemark({ ...placemarks.sightseeing });
    const placemark = await db.placemarkStore.getPlacemarkById(newPlacemark._id);
    assert.equal(placemark._id, newPlacemark._id);
  });

  test("get placemark by id | fail not found", async () => {
    const placemark = await db.placemarkStore.getPlacemarkById("12345");
    assert.isUndefined(placemark);
  });

  test("update placemark | succeed", async () => {
    const newPlacemark = await db.placemarkStore.addPlacemark({ ...placemarks.sightseeing });
    const updatedPlacemark = {
      title: "Updated Title",
      description: "Updated Description",
    };
    await db.placemarkStore.updatePlacemarkById(newPlacemark._id, updatedPlacemark);
    const fetchedPlacemark = await db.placemarkStore.getPlacemarkById(newPlacemark._id);
    assert.equal(fetchedPlacemark.title, updatedPlacemark.title);
    assert.equal(fetchedPlacemark.description, updatedPlacemark.description);
  });

  test("update placemark | fail not found", async () => {
    const result = await db.placemarkStore.updatePlacemarkById("12345", {});
    assert.isNull(result);
  });

  test("delete placemark | succeed", async () => {
    const newPlacemark = await db.placemarkStore.addPlacemark({ ...placemarks.sightseeing });
    await db.placemarkStore.deletePlacemarkById(newPlacemark._id);
    const placemark = await db.placemarkStore.getPlacemarkById(newPlacemark._id);
    assert.isUndefined(placemark);
  });

  test("delete placemark | fail not found", async () => {
    await db.placemarkStore.deletePlacemarkById("12345");
    assert.isTrue(true);
  });

  test("create placemark | fail missing title", async () => {
    const placemark = {
      category: "Test",
      latitude: 10,
      longitude: 10,
    };
    const result = await db.placemarkStore.addPlacemark(placemark);
    assert.isNull(result);
  });

  test("create placemark | fail empty string title", async () => {
    const placemark = {
      title: "   ",
      category: "Test",
      latitude: 10,
      longitude: 10,
    };
    const result = await db.placemarkStore.addPlacemark(placemark);
    assert.isNull(result);
  });

  test("create placemark | fail invalid latitude", async () => {
    const placemark = {
      title: "Test",
      category: "Test",
      latitude: 91,
      longitude: 10,
    };
    const result = await db.placemarkStore.addPlacemark(placemark);
    assert.isNull(result);
  });

  test("create placemark | fail invalid longitude", async () => {
    const placemark = {
      title: "Test",
      category: "Test",
      latitude: 10,
      longitude: -181,
    };
    const result = await db.placemarkStore.addPlacemark(placemark);
    assert.isNull(result);
  });

  test("delete all placemarks | succeed", async () => {
    await db.placemarkStore.deleteAllPlacemarks();
    const placemarksList = await db.placemarkStore.getAllPlacemarks();
    assert.equal(placemarksList.length, 0);
  });
});
