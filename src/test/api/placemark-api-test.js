import { readFileSync } from "fs";
import { assert } from "chai";
import { placemarkService } from "../placemark-service.js";
import { placemarks, users } from "../fixtures.js";

suite("Placemark API tests", () => {
  let user = null;

  setup(async () => {
    placemarkService.clearAuth();
    user = await placemarkService.createUser(users.moritz);
    await placemarkService.authenticate(users.moritz);
    await placemarkService.deleteAllPlacemarks();
  });

  teardown(async () => {
    await placemarkService.deleteAllPlacemarks();
    placemarkService.clearAuth();
    await placemarkService.createUser(users.adminUser);
    await placemarkService.authenticate(users.adminUser);
    await placemarkService.deleteAllUsers();
    placemarkService.clearAuth();
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
      const status = error?.statusCode || error?.response?.status;
      assert.equal(status, 404);
    }
  });

  test("delete all placemarks", async () => {
    await placemarkService.createPlacemark(placemarks.sightseeing);
    await placemarkService.deleteAllPlacemarks();
    const allPlacemarks = await placemarkService.getAllPlacemarks();
    assert.equal(allPlacemarks.length, 0);
  });

  test("delete all user placemarks only deletes own placemarks", async () => {
    await placemarkService.createPlacemark(placemarks.sightseeing);

    placemarkService.clearAuth();
    await placemarkService.createUser(users.jannis);
    await placemarkService.authenticate(users.jannis);

    await placemarkService.createPlacemark(placemarks.restaurant);

    let allPlacemarks = await placemarkService.getAllPlacemarks();
    assert.equal(allPlacemarks.length, 1);
    assert.equal(allPlacemarks[0].title, placemarks.restaurant.title);

    await placemarkService.deleteAllUserPlacemarks();

    allPlacemarks = await placemarkService.getAllPlacemarks();
    assert.equal(allPlacemarks.length, 0);

    placemarkService.clearAuth();
    await placemarkService.authenticate(users.moritz);
    allPlacemarks = await placemarkService.getAllPlacemarks();
    assert.equal(allPlacemarks.length, 1);
    assert.equal(allPlacemarks[0].title, placemarks.sightseeing.title);
  });

  const skipImageTest = process.env.SKIP_IMAGE_TESTS === "true";

  (skipImageTest ? test.skip : test)("upload image to placemark via api", async function () {
    this.timeout(10000);
    const newPlacemark = await placemarkService.createPlacemark(placemarks.sightseeing);
    const imgBuffer = readFileSync("./public/favicon.png");
    const blob = new Blob([imgBuffer]);
    const updatedPlacemark = await placemarkService.uploadImage(newPlacemark._id, blob);
    assert.isNotNull(updatedPlacemark.images);
    assert.isArray(updatedPlacemark.images);
    assert.isTrue(updatedPlacemark.images.length > 0);
    assert.include(updatedPlacemark.images[0], "cloudinary.com");
    await placemarkService.deletePlacemark(updatedPlacemark._id);
  });
});
