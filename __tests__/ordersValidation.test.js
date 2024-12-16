const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");
const Order = require("../models/orderModel"); // Assuming this is your Mongoose model for orders.

describe("Orders Validation", () => {
  let agent;
  let server;

  // Start the server before tests and ensure it stops after
  beforeAll(async () => {
    // Connect to the database
    await connectToDatabase();

    // Start the server and store the server instance
    server = await startServer();

    // Use agent for maintaining sessions
    agent = request.agent(app);

    // Perform login before each test
    await agent.post("/test-login").send({
      _id: '675f5a4967f3af115a3136f9',
      role: 'admin',
      email: 'admin@example.com',
      githubId: 'mockGithubId',
      displayName: 'Admin User',
      avatarUrl: 'https://example.com/avatar.jpg',
    });
  });

  it("should return validation error when creating an order with invalid fields", async () => {
    const newOrder = {
      invalidField: 'Some invalid data',
      items: [
        { partId: '675526a65147b661d631771f', quantity: 2 },
        { partId: '675d22bf0dcafd91fa89f5a5', quantity: 1 }
      ],
      status: 'Pending',
    };

    const response = await agent.post("/orders").send(newOrder);

    expect(response.status).toBe(422);
    expect(response.body.error).toContain("Invalid fields: invalidField");
  });

  it("should return validation error when items array is empty", async () => {
    const newOrder = {
      items: [], // Empty array
      status: 'Pending',
    };

    const response = await agent.post("/orders").send(newOrder);

    expect(response.status).toBe(422);
    expect(response.body.error).toContain("Items must be a non-empty array.");
  });

  it("should return validation error when items contain invalid partId or quantity", async () => {
    const newOrder = {
      items: [
        { partId: 'invalidPartId', quantity: 2 }, // Invalid partId
        { partId: '675d22bf0dcafd91fa89f5a5', quantity: -1 } // Invalid quantity
      ],
      status: 'Pending',
    };

    const response = await agent.post("/orders").send(newOrder);

    expect(response.status).toBe(422);
    expect(response.body.error).toContain('Each item must contain a valid partId and quantity (positive integer).');
  });

  it("should return validation error when partId does not exist in the database", async () => {
    const newOrder = {
      items: [
        { partId: '675d22bf0dcafd91fa89f5a0', quantity: 1 },
      ],
      status: 'Pending',
    };

    const response = await agent.post("/orders").send(newOrder);

    expect(response.status).toBe(422);
    expect(response.body.error).toContain("One or more partId values do not exist in the database.");
  });

  it("should return validation error when status is invalid", async () => {
    const newOrder = {
      items: [
        { partId: '675526a65147b661d631771f', quantity: 2 },
      ],
      status: 'InvalidStatus', // Invalid status
    };

    const response = await agent.post("/orders").send(newOrder);

    expect(response.status).toBe(422);
    expect(response.body.error).toContain("Status must be one of: Pending, Shipped, Completed.");
  });

  it("should return validation error when request body is empty", async () => {
    const response = await agent.post("/orders").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Request body cannot be empty.");
  });

  it("should return validation error when updating an order with no fields provided", async () => {
    const response = await agent.put("/orders/675bd5aaf7d0c29ac0257953").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Request body cannot be empty.");
  });

  it("should return validation error when updating a non-existent order", async () => {
    const updatedOrder = { status: 'Shipped' };

    const response = await agent
      .put("/orders/675bd5aaf7d0c29ac0257950") // Non-existent order ID
      .send(updatedOrder);

    expect(response.status).toBe(404);
    expect(response.body.error).toContain("Order with ID 675bd5aaf7d0c29ac0257950 not found.");
  });

  // Close server after all tests
  afterAll(() => {
    server.close();
  });
});
