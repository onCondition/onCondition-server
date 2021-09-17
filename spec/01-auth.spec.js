const request = require("supertest");

const { dbConnect, dbDisconnect } = require("./db");
const app = require("../app");
const firebase = require("../config/firebase");

const User = require("../models/User");
const { mockUser, mockToken } = require("./mockData");
const { OK } = require("../constants/statusCodes");

beforeAll(async () => await dbConnect());
afterAll(async () => await dbDisconnect());

describe("POST /login", () => {
  afterEach(async () => {
    try {
      await User.deleteMany();
    } catch (err) {
      console.log(`err: ${err} cannot delete mock user`);
    }
  });

  it("should get user info from firebase admin", async () => {
    const spyVerifyToken = jest.fn()
      .mockReturnValueOnce({
        uid: mockUser.uid,
        picture: mockUser.profileUrl,
        name: mockUser.name,
      });

    const mockAuth = jest.spyOn(firebase, "auth")
      .mockReturnValueOnce({ verifyIdToken: spyVerifyToken });

    await request(app)
      .post("/login")
      .set("authorization", "Bearer mockFirebaseIdToken")
      .expect(OK);

    expect(mockAuth).toBeCalledTimes(1);
    expect(mockAuth).toBeCalledWith();
    expect(spyVerifyToken).toBeCalledTimes(1);
    expect(spyVerifyToken).toBeCalledWith("mockFirebaseIdToken");
  });

  describe("should handle when proper idToken is sended", () => {
    beforeEach(() => {
      const spyVerifyToken = jest.fn()
        .mockReturnValueOnce({
          uid: mockUser.uid,
          picture: mockUser.profileUrl,
          name: mockUser.name,
        });

      jest.spyOn(firebase, "auth")
        .mockReturnValueOnce({ verifyIdToken: spyVerifyToken });
    });

    it("should create user when new user's idToken is sended", async () => {
      await request(app)
        .post("/login")
        .set("authorization", "Bearer mockFirebaseIdToken")
        .expect(OK)
        .expect("Content-Type", /json/);

      const createdUser = await User.findOne({ uid: mockUser.uid });

      expect(createdUser).toBeTruthy();
      expect(createdUser.profileUrl).toBe(mockUser.profileUrl);
      expect(createdUser.name).toBe(mockUser.name);
    });

    it("should create respond accessToken when idToken is sended", async () => {
      const res = await request(app)
        .post("/login")
        .set("authorization", "Bearer mockFirebaseIdToken")
        .expect(OK)
        .expect("Content-Type", /json/);

      expect(res.body).toBeTruthy();
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");

      const { accessToken, refreshToken } = res.body;

      expect(accessToken).toHaveProperty("token");
      expect(typeof accessToken.token).toBe("string");
      expect(accessToken).toHaveProperty("exp");
      expect(typeof accessToken.exp).toBe("number");

      expect(refreshToken).toHaveProperty("token");
      expect(typeof refreshToken.token).toBe("string");
      expect(refreshToken).toHaveProperty("exp");
      expect(typeof refreshToken.exp).toBe("number");

      await request(app)
        .get("/")
        .set("authorization", `Bearer ${accessToken.token}`)
        .expect(OK)
        .expect("Content-Type", /json/);
    });
  });

  it("should update when user's profile has changed", async () => {
    await User.create({ ...mockUser });

    const spyVerifyToken = jest.fn()
      .mockReturnValueOnce({
        uid: mockUser.uid,
        picture: "updated picture",
        name: mockUser.name,
      });

    jest.spyOn(firebase, "auth")
      .mockReturnValueOnce({ verifyIdToken: spyVerifyToken });

    await request(app)
      .post("/login")
      .set("authorization", "Bearer mockFirebaseIdToken")
      .expect(OK)
      .expect("Content-Type", /json/);

    const user = await User.findOne({ uid: mockUser.uid });

    expect(user).toBeTruthy();
    expect(user).toHaveProperty("profileUrl");
    expect(user.profileUrl).toBe("updated picture");
  });

  describe("GET /", () => {
    it("should response user info when accessToken is sended", async () => {
      await User.create({ ...mockUser });

      const res = await request(app)
        .get("/")
        .set("authorization", `Bearer ${mockToken}`)
        .expect(OK)
        .expect("Content-Type", /json/);

      expect(res.body).toBeTruthy();
      expect(res.body).toHaveProperty("userId");
      expect(res.body).toHaveProperty("customCategories");
      expect(res.body).toHaveProperty("lastAccessDate");

      const { customCategories, lastAccessDate } = res.body;
      const date = new Date(lastAccessDate);

      expect(customCategories).toBeInstanceOf(Array);
      expect(date.getTime()).toBeTruthy();
    });
  });
});
