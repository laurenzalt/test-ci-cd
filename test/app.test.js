const request = require("supertest");
const { expect } = require("chai");
const { app, sequelize, User, initializeServer } = require("../src/app");

// Mocha-Hooks
before(async () => {
  await initializeServer();
});

after(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {} }); 
});

describe("API Tests", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "OK");
      expect(res.body).to.have.property("timestamp");
    });
  });

  describe("User CRUD Operations", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
      };

      const res = await request(app).post("/api/users").send(userData);

      expect(res.status).to.equal(201);
      expect(res.body.name).to.equal(userData.name);
      expect(res.body.email).to.equal(userData.email);
    });

    it("should get all users", async () => {
      await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).get("/api/users");

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    });

    it("should get a specific user", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).get(`/api/users/${user.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal(user.name);
    });

    it("should update a user", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const updateData = {
        name: "Updated Name",
      };

      const res = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData);

      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal(updateData.name);
    });

    it("should delete a user", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).delete(`/api/users/${user.id}`);

      expect(res.status).to.equal(204);

      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).to.be.null;
    });
  });
});
