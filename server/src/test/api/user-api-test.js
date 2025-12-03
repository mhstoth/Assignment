import { assert } from "chai";
import { placemarkService } from "../placemark-service.js";
import { users } from "../fixtures.js";

suite("User API tests", () => {
  setup(async () => {
    await placemarkService.deleteAllUsers();
  });

  teardown(async () => {
    await placemarkService.deleteAllUsers();
  });

  test("create a user", async () => {
    const newUser = await placemarkService.createUser(users.moritz);
    assert.isNotNull(newUser);
    assert.isNotNull(newUser._id);
    assert.equal(newUser.firstName, users.moritz.firstName);
  });

  test("get all users", async () => {
    await placemarkService.createUser(users.moritz);
    await placemarkService.createUser(users.jannis);
    const allUsers = await placemarkService.getAllUsers();
    assert.equal(allUsers.length, 2);
  });

  test("get user", async () => {
    const newUser = await placemarkService.createUser(users.moritz);
    const user = await placemarkService.getUser(newUser._id);
    assert.equal(user.email, users.moritz.email);
  });

  test("delete all users", async () => {
    await placemarkService.createUser(users.moritz);
    await placemarkService.deleteAllUsers();
    const allUsers = await placemarkService.getAllUsers();
    assert.equal(allUsers.length, 0);
  });
});
