/* eslint-disable no-magic-numbers */
const request = require("supertest");

const {
  dbConnect,
  dbDisconnect,
} = require("./db");
const app = require("../app");

const User = require("../models/User");
const Activity = require("../models/Activity");
const Step = require("../models/Step");
const {
  mockToken,
  mockUserId,
  mockUser,
  mockActivityId,
  mockActivity,
  mockStep,
} = require("./mockData");

beforeAll(() => dbConnect());
afterAll(async () => await dbDisconnect());

describe("activity controller test", () => {
  jest.setTimeout(30000);

  afterEach(async () => {
    try {
      await User.deleteMany();
      await Activity.deleteMany();
    } catch (err) {
      console.log(`err: ${err} cannot create mock activity`);
    }
  });

  describe("endpoint /:creatorId/activity/:activityId", () => {
    beforeEach(async () => {
      try {
        await User.create(mockUser);
        await Activity.create(mockActivity);
      } catch (err) {
        console.log(`err: ${err} cannot create mock activity`);
      }
    });

    test("it should response activity for GET /:creatorId/activity/:activityId", async () => {
      const spyFindById = jest.spyOn(Activity, "findById");
      const res = await request(app)
        .get(`/${mockUserId}/activity/${mockActivityId}`)
        .set("authorization", `Bearer ${mockToken}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(spyFindById).toBeCalledTimes(1);
      expect(spyFindById).toBeCalledWith(mockActivityId);

      expect(res.body).toBeTruthy();
      expect(res.body.result).toBe("ok");
      expect(res.body.accessLevel).toBe("creator");
      expect(res.body.data).toBeTruthy();

      const activity = res.body.data;

      expect(activity._id).toBe(mockActivityId);
      expect(activity.creator).toBe(mockUserId);
      expect(activity.sessionId).toBe("AA-BB-CC"),
      expect(activity.duration).toBe(1);

      const date = new Date(activity.date);

      expect(date.getTime()).toBeTruthy();
      expect(activity.type).toBe("Walking");
    });

    test("it should update activity for PATCH /:creatorId/activity/:activityId", async () => {
      const spyUpdate = jest.spyOn(Activity, "findByIdAndUpdate");

      await request(app)
        .patch(`/${mockUserId}/activity/${mockActivityId}`)
        .set("authorization", `Bearer ${mockToken}`)
        .send({ heartCount: 8, text: "updated" })
        .expect(200)
        .expect("Content-Type", /json/)
        .expect({ result: "ok" });

      expect(spyUpdate).toBeCalledTimes(1);
      expect(spyUpdate).toBeCalledWith(mockActivityId, {
        rating: { heartCount: 8, text: "updated" },
      });

      const updatedActivity = await Activity.findById(mockActivityId);

      expect(updatedActivity.rating.heartCount).toBe(8);
      expect(updatedActivity.rating.text).toBe("updated");
    });

    test("it should delete activity for DELETE /:creatorId/activity/:activityId", async () => {
      const spyDelete = jest.spyOn(Activity, "findByIdAndDelete");

      await request(app)
        .delete(`/${mockUserId}/activity/${mockActivityId}`)
        .set("authorization", `Bearer ${mockToken}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .expect({ result: "ok" });

      expect(spyDelete).toBeCalledTimes(1);
      expect(spyDelete).toBeCalledWith(mockActivityId);
      expect(await Activity.findById(mockActivityId)).toBeNull;
    });
  });

  describe("endpoint GET for /:creatorId/activity", () => {
    beforeEach(async () => {
      const pendingActivities = [];
      const date = Date.now();

      for (let i = 0; i < 15; i++) {
        pendingActivities.push(Activity.create({
          ...mockActivity,
          _id: null,
          date: new Date(date + i),
          duration: ((value) => value)(i),
        }));
      }

      try {
        await User.create(mockUser);
        await Promise.all(pendingActivities);
      } catch (err) {
        console.log(`err: ${err} cannot create mock activities`);
      }
    });

    test("it should response activities with no page option", async () => {
      const spyFind = jest.spyOn(Activity, "find");

      const res = await request(app)
        .get(`/${mockUserId}/activity`)
        .set("authorization", `Bearer ${mockToken}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(spyFind).toBeCalledTimes(1);
      expect(res.body).toBeTruthy();
      expect(res.body.result).toBe("ok");
      expect(res.body.prevPage).toBe(null);
      expect(res.body.nextPage).toBe(2);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.activities).toBeTruthy();

      const activities = res.body.data.activities;
      const activityKeys = activities.map(({ _id }) => _id);
      const uniqueKeys = [...new Set(activityKeys)];
      const isSortedByDate = activities.slice(0, -1).every((activity, i) => {
        return new Date(activity.date) >= new Date(activities[i + 1].date);
      });

      expect(activities.length).toBe(7); // default page limit
      expect(uniqueKeys.length).toBe(7);
      expect(isSortedByDate).toBeTruthy();
    });

    test("it should response activities for specific page", async () => {
      const res = await request(app)
        .get(`/${mockUserId}/activity`)
        .set("authorization", `Bearer ${mockToken}`)
        .set("page", 2)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toBeTruthy();
      expect(res.body.result).toBe("ok");
      expect(res.body.prevPage).toBe(1);
      expect(res.body.nextPage).toBe(3);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.activities).toBeTruthy();

      const activities = res.body.data.activities;
      const durations = activities.map(({ duration }) => duration);

      expect(durations).toEqual([7, 6, 5, 4, 3, 2, 1]);
    });

    test("it should response activities for specific page, when next is lastPage", async () => {
      const res = await request(app)
        .get(`/${mockUserId}/activity`)
        .set("authorization", `Bearer ${mockToken}`)
        .set("page", 3)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toBeTruthy();
      expect(res.body.result).toBe("ok");
      expect(res.body.prevPage).toBe(2);
      expect(res.body.nextPage).toBe(null);
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.activities).toBeTruthy();

      const activities = res.body.data.activities;
      const durations = activities.map(({ duration }) => duration);

      expect(durations).toEqual([0]);
    });

    test("it should response step data", async () => {
      await Step.create(mockStep);

      const res = await request(app)
        .get(`/${mockUserId}/activity`)
        .set("authorization", `Bearer ${mockToken}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(res.body).toBeTruthy();
      expect(res.body.result).toBe("ok");
      expect(res.body.data).toBeTruthy();
      expect(res.body.data.stepCount).toBeTruthy();
      expect(res.body.data.stepCount).toBe(1000);
    });
  });
});
