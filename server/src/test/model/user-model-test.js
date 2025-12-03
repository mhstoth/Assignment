import { assert } from "chai";
import { db } from "../../models/db.js";
import { users } from "../fixtures.js";

suite("User Model tests", () => {
  setup(async () => {
    db.init();
    await db.userStore.deleteAllUsers();
    await db.userStore.addUser(users.moritz);
  });

  test("create a user | succeed", async () => {
    const user = {
      firstName: "Moritz",
      lastName: "Hutzler",
      email: "moritz@diehutzlers.de",
      password: "123456",
    };

    await db.userStore.addUser(user);

    const storedUser = await db.userStore.getUserByEmail(user.email);

    assert.equal(storedUser.firstName, user.firstName);
    assert.equal(storedUser.lastName, user.lastName);
    assert.equal(storedUser.email, user.email);
    assert.equal(storedUser.password, user.password);
  });

  test("create user | fail bad param", async () => {
    const user = {
      firstName: "Moritz",
      email: "moritz@diehutzlers.de",
      password: "123456",
    };
    const newUser = await db.userStore.addUser(user);
    assert.isNull(newUser);
  });

  test("get user by email | succeed", async () => {
    const user = await db.userStore.getUserByEmail(users.moritz.email);
    assert.isNotNull(user);
    assert.equal(user.email, users.moritz.email);
    assert.equal(user.firstName, users.moritz.firstName);
    assert.equal(user.lastName, users.moritz.lastName);
    assert.equal(user.email, users.moritz.email);
    assert.equal(user.password, users.moritz.password);
  });

  test("get user by email | fail bad param", async () => {
    await db.userStore.addUser(users.ava);
    const user = await db.userStore.getUserByEmail("123456789");
    assert.isNull(user);
  });

  test("get user by email | fail not found", async () => {
    await db.userStore.addUser(users.ava);
    const user = await db.userStore.getUserByEmail("unknown@test.com");
    assert.isUndefined(user);
  });

  test("get user by id | succeed", async () => {
    const user = await db.userStore.getUserById(users.moritz._id);
    assert.isNotNull(user);
    assert.equal(user.email, users.moritz.email);
  });

  test("get user by id | fail not found", async () => {
    const user = await db.userStore.getUserById("12345");
    assert.isUndefined(user);
  });

  test("update user | succeed", async () => {
    const user = await db.userStore.getUserByEmail(users.moritz.email);
    const updatedUser = {
      firstName: "Updated",
      lastName: "User",
      email: "updated@test.com",
      password: "newpassword",
    };
    await db.userStore.updateUser(user._id, updatedUser);
    const fetchedUser = await db.userStore.getUserById(user._id);
    assert.equal(fetchedUser.firstName, updatedUser.firstName);
    assert.equal(fetchedUser.email, updatedUser.email);
  });

  test("update user | fail not found", async () => {
    const updatedUser = {
      firstName: "Updated",
      lastName: "User",
      email: "updated@test.com",
      password: "newpassword",
    };
    const result = await db.userStore.updateUser("12345", updatedUser);
    assert.isNull(result);
  });

  test("delete user | succeed", async () => {
    await db.userStore.deleteUserById(users.moritz._id);
    const user = await db.userStore.getUserById(users.moritz._id);
    assert.isUndefined(user);
  });

  test("delete user | fail not found", async () => {
    await db.userStore.deleteUserById("12345");
    assert.isTrue(true);
  });

  test("delete all users | succeed", async () => {
    await db.userStore.deleteAllUsers();
    const usersList = await db.userStore.getAllUsers();
    assert.equal(usersList.length, 0);
  });
});
