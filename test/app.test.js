const request = require("supertest");
const { app, sequelize, User, initializeServer } = require("../src/app");

beforeAll(async () => {
  await initializeServer();
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await User.destroy({ where: {} }); // Clear all users before each test
});

describe("API Tests", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "OK");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  describe("User CRUD Operations", () => {
    it("should create a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
      };

      const res = await request(app).post("/api/users").send(userData);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(userData.name);
      expect(res.body.email).toBe(userData.email);
    });

    it("should get all users", async () => {
      // Create a test user first
      await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).get("/api/users");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get a specific user", async () => {
      // Create a test user first
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(user.name);
    });

    it("should update a user", async () => {
      // Create a test user first
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

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updateData.name);
    });

    it("should delete a user", async () => {
      // Create a test user first
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
      });

      const res = await request(app).delete(`/api/users/${user.id}`);

      expect(res.status).toBe(204);

      // Verify user is deleted
      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });
  });
});