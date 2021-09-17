const request = require("supertest");

const { dbConnect, dbDisconnect } = require("./db");
const app = require("../app");

const User = require("../models/User");
const Activity = require("../models/Activity");
const Comment = require("../models/Comment");
const {
  mockToken,
  friendMockToken,
  mockUserId,
  mockUser,
  mockComment,
  mockActivity,
} = require("./mockData");

const {
  OK, CREATED, BAD_REQUEST, UNAUTHORIZED,
} = require("../constants/statusCodes");
const { ERROR } = require("../constants/messages");
const TIME_OUT = 30000;

beforeAll(async () => await dbConnect());
afterAll(async () => await dbDisconnect());

describe("comment controller test /:creatorId/:category/:ratingId/comment", () => {
  jest.setTimeout(TIME_OUT);

  beforeEach(async () => {
    try {
      await User.create(mockUser);
      await Activity.create({
        ...mockActivity,
        comments: [mockComment._id],
      });
      await Comment.create(mockComment);
    } catch (err) {
      console.log(`err: ${err} cannot set environment for mockComment`);
    }
  });

  afterEach(async () => {
    try {
      await User.deleteMany();
      await Activity.deleteMany();
      await Comment.deleteMany();
    } catch (err) {
      console.log(`err: ${err} cannot clean up environment for mockComment`);
    }
  });

  describe("POST /", () => {
    test("it should add category", async () => {
      const user = await User.findById(mockUserId);

      expect(user).toHaveProperty("customCategories");
      expect(user.customCategories.length).toBe(0);

      const spyFindAndUpdate = jest.spyOn(User, "findByIdAndUpdate");

      await request(app)
        .post(`/${mockUserId}/preference`)
        .set("authorization", `Bearer ${mockToken}`)
        .send({ category: "mock grid", categoryType: "grid" })
        .expect(CREATED)
        .expect("Content-Type", /json/);

      expect(spyFindAndUpdate).toBeCalledTimes(1);
      expect(spyFindAndUpdate).toBeCalledWith(
        mockUserId,
        {
          $push: { customCategories: [{ category: "mock grid", categoryType: "grid" }] },
        },
        { new: true },
      );

      const updatedUser = await User.findById(mockUserId);

      expect(updatedUser).toHaveProperty("customCategories");
      expect(updatedUser.customCategories.length).toBe(1);

      const createdCategory = updatedUser.customCategories[0];

      expect(createdCategory).toHaveProperty("category");
      expect(createdCategory).toHaveProperty("categoryType");
      expect(createdCategory.category).toBe("mock grid");
      expect(createdCategory.categoryType).toBe("grid");
    });

    test("it should not add duplicated category", async () => {
      const user = await User.findByIdAndUpdate(mockUserId,
        { $push: { customCategories: [{ category: "duplicate", categoryType: "album" }] } },
        { new: true },
      );

      expect(user).toHaveProperty("customCategories");
      expect(user.customCategories.length).toBe(1);
      expect(user.customCategories[0].category).toBe("duplicate");

      const spyFindAndUpdate = jest.spyOn(User, "findByIdAndUpdate");

      await request(app)
        .post(`/${mockUserId}/preference`)
        .set("authorization", `Bearer ${mockToken}`)
        .send({ category: "duplicate", categoryType: "grid" })
        .expect(BAD_REQUEST)
        .expect("Content-Type", /json/)
        .expect({ error: ERROR.INVALID_OVERLAP_CATEGORY_NAME });

      expect(spyFindAndUpdate).toBeCalledTimes(0);

      const updatedUser = await User.findById(mockUserId);

      expect(updatedUser).toHaveProperty("customCategories");
      expect(updatedUser.customCategories.length).toBe(1);

      const createdCategory = updatedUser.customCategories[0];

      expect(createdCategory).toHaveProperty("category");
      expect(createdCategory).toHaveProperty("categoryType");
      expect(createdCategory.category).toBe("duplicate");
      expect(createdCategory.categoryType).toBe("album");
    });
  });

  describe("DELETE /:category", () => {
    test("it should delete category", async () => {
      await User.findByIdAndUpdate(mockUserId,
        { $push: { customCategories: [{ category: "dummy", categoryType: "grid" }] } },
        { new: true },
      );

      const spyFindById = jest.spyOn(User, "findById");
      const spyFindAndUpdate = jest.spyOn(User, "findByIdAndUpdate");

      await request(app)
        .delete(`/${mockUserId}/preference/dummy`)
        .set("authorization", `Bearer ${mockToken}`)
        .expect(OK)
        .expect("Content-Type", /json/)
        .expect({ result: "OK", data: [] });

      expect(spyFindById).toBeCalledWith(mockUserId);
      expect(spyFindAndUpdate).toBeCalledTimes(1);
      expect(spyFindAndUpdate).toBeCalledWith(mockUserId,
        { $pull: { customCategories: { category: "dummy" } } },
        { new: true },
      );
    });

    test("it should response error when category not exist", async () => {
      await request(app)
        .delete(`/${mockUserId}/preference/notExistCategory`)
        .set("authorization", `Bearer ${mockToken}`)
        .expect(BAD_REQUEST)
        .expect("Content-Type", /json/);
    });

    test("it should not delete category for other user's request", async () => {
      await User.findByIdAndUpdate(mockUserId,
        { $push: { customCategories: [{ category: "dummy", categoryType: "grid" }] } },
        { new: true },
      );

      const spyFindById = jest.spyOn(User, "findById");
      const spyFindAndUpdate = jest.spyOn(User, "findByIdAndUpdate");

      await request(app)
        .delete(`/${mockUserId}/preference/dummy`)
        .set("authorization", `Bearer ${friendMockToken}`)
        .expect(UNAUTHORIZED)
        .expect("Content-Type", /json/);

      expect(spyFindById).toBeCalledWith(mockUserId);
      expect(spyFindAndUpdate).toBeCalledTimes(0);

      const updatdUser = await User.findById(mockUserId);

      expect(updatdUser.customCategories.length).toBe(1);
      expect(updatdUser.customCategories[0].category).toBe("dummy");
    });
  });
});
