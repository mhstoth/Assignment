import { assert } from "chai";
import { placemarkService } from "../placemark-service.js";
import { decodeToken } from "../../api/jwt-utils.js";
import { users } from "../fixtures.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    placemarkService.clearAuth();
    await placemarkService.createUser(users.adminUser);
    await placemarkService.authenticate(users.adminUser);
    await placemarkService.deleteAllUsers();
  });

  test("authenticate", async () => {
    const returnedUser = await placemarkService.createUser(users.ava);
    const response = await placemarkService.authenticate(users.ava);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const returnedUser = await placemarkService.createUser(users.ava);
    const response = await placemarkService.authenticate(users.ava);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });
});
