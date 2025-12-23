import { assert } from "chai";
import { placemarkService } from "../placemark-service.js";
import { users } from "../fixtures.js";

suite("User API tests", () => {
  setup(async () => {
    placemarkService.clearAuth();
    await placemarkService.createUser(users.adminUser);
    await placemarkService.authenticate(users.adminUser);
    await placemarkService.deleteAllUsers();
    await placemarkService.createUser(users.adminUser);
    await placemarkService.authenticate(users.adminUser);
  });

  teardown(async () => {
    await placemarkService.deleteAllUsers();
    placemarkService.clearAuth();
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
    assert.equal(allUsers.length, 3);
  });

  test("get user", async () => {
    const newUser = await placemarkService.createUser(users.moritz);
    const user = await placemarkService.getUser(newUser._id);
    assert.equal(user.email, users.moritz.email);
  });

  test("delete all users", async () => {
    await placemarkService.createUser(users.moritz);
    await placemarkService.deleteAllUsers();
    await placemarkService.createUser(users.adminUser);
    await placemarkService.authenticate(users.adminUser);
    const allUsers = await placemarkService.getAllUsers();
    assert.equal(allUsers.length, 1);
  });

  test("create admin user | isAdmin true", async () => {
    const newUser = await placemarkService.createUser(users.adminUser);
    assert.isNotNull(newUser);
    assert.equal(newUser.isAdmin, true);
  });

  test("create regular user | isAdmin false", async () => {
    const newUser = await placemarkService.createUser(users.regularUser);
    assert.isNotNull(newUser);
    assert.equal(newUser.isAdmin, false);
  });

  test("get all users | includes isAdmin status", async () => {
    await placemarkService.createUser(users.moritz);
    await placemarkService.createUser(users.regularUser);
    const allUsers = await placemarkService.getAllUsers();

    const admin = allUsers.find((u) => u.email === users.adminUser.email);
    const regular = allUsers.find((u) => u.email === users.regularUser.email);

    assert.isNotNull(admin);
    assert.isNotNull(regular);
    assert.equal(admin.isAdmin, true);
    assert.equal(regular.isAdmin, false);
  });

  test("delete user by id", async () => {
    const newUser = await placemarkService.createUser(users.moritz);
    await placemarkService.deleteUser(newUser._id);
    const allUsers = await placemarkService.getAllUsers();
    assert.equal(allUsers.length, 1);
  });
  test("update user", async () => {
    const newUser = await placemarkService.createUser(users.moritz);
    const updatedDetails = {
      firstName: "Updated",
      lastName: "User",
      email: "updated@user.com",
      password: "newpassword",
    };
    const updatedUser = await placemarkService.updateUser(newUser._id, updatedDetails);
    assert.equal(updatedUser.firstName, "Updated");
    assert.equal(updatedUser.email, "updated@user.com");

    const fetchedUser = await placemarkService.getUser(newUser._id);
    assert.equal(fetchedUser.firstName, "Updated");
  });
});
