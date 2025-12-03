import { assert } from "chai";
import { placemarkService } from "../placemark-service.js";
import { placemarks, users } from "../fixtures.js";

suite("Placemark API tests", () => {
  let user = null;

  setup(async () => {
    await placemarkService.deleteAllPlacemarks();
    await placemarkService.deleteAllUsers();
    user = await placemarkService.createUser(users.moritz);
  });

  teardown(async () => {
    await placemarkService.deleteAllPlacemarks();
    await placemarkService.deleteAllUsers();
  });

  test("create a placemark", async () => {
    const newPlacemark = await placemarkService.createPlacemark(placemarks.sightseeing);
    assert.isNotNull(newPlacemark);
    assert.isNotNull(newPlacemark._id);
    assert.equal(newPlacemark.title, placemarks.sightseeing.title);
  });

  test("get all placemarks", async () => {
    await placemarkService.createPlacemark(placemarks.sightseeing);
    await placemarkService.createPlacemark(placemarks.restaurant);
    const allPlacemarks = await placemarkService.getAllPlacemarks();
    assert.equal(allPlacemarks.length, 2);
  });

  test("get placemark", async () => {
    const newPlacemark = await placemarkService.createPlacemark(placemarks.sightseeing);
    const placemark = await placemarkService.getPlacemark(newPlacemark._id);
    assert.equal(placemark.title, placemarks.sightseeing.title);
  });

  test("delete placemark", async () => {
    const newPlacemark = await placemarkService.createPlacemark(placemarks.sightseeing);
    await placemarkService.deletePlacemark(newPlacemark._id);
    try {
      await placemarkService.getPlacemark(newPlacemark._id);
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.equal(error.response.status, 404);
    }
  });

  test("delete all placemarks", async () => {
    await placemarkService.createPlacemark(placemarks.sightseeing);
    await placemarkService.deleteAllPlacemarks();
    const allPlacemarks = await placemarkService.getAllPlacemarks();
    assert.equal(allPlacemarks.length, 0);
  });
});
