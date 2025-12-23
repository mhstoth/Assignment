import { readFileSync, existsSync } from "fs";
import { assert } from "chai";
import { imageStore } from "../../models/image-store.js";

suite("ImageStore tests", () => {
  setup(async () => {
    if (!existsSync("./public/favicon.png")) {
      throw new Error("Test image ./public/favicon.png not found");
    }
  });

  test("upload and delete image | succeed with favicon", async function () {
    this.timeout(10000);
    const imgBuffer = readFileSync("./public/favicon.png");

    const url = await imageStore.uploadImage(imgBuffer);
    assert.isNotNull(url);
    assert.include(url, "cloudinary.com");

    await imageStore.deleteImage(url);
    assert.isTrue(true);
  });

  test("upload image | fail with invalid data", async function () {
    this.timeout(10000);
    try {
      await imageStore.uploadImage(null);
      assert.fail("Should have thrown an error for null data");
    } catch (e) {
      assert.isNotNull(e);
    }

    try {
      await imageStore.uploadImage(Buffer.from([]));
      assert.fail("Should have thrown an error for empty buffer");
    } catch (e) {
      assert.isNotNull(e);
    }
  });

  test("deleteImage | ignore non-cloudinary urls", async () => {
    await imageStore.deleteImage("https://images.unsplash.com/photo-123");
    assert.isTrue(true);
  });

  test("deleteImage | handle null/undefined", async () => {
    await imageStore.deleteImage(null);
    await imageStore.deleteImage(undefined);
    assert.isTrue(true);
  });
});
