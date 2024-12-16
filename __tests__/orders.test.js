const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");
const Order = require("../models/orderModel"); // Assuming this is your Mongoose model for orders.

describe("Orders Routes", () => {
  let agent;
  let orderId;
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

  it("should get a list of orders", async () => {
    const response = await agent.get("/orders");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should create a new order", async () => {
    const newOrder = {
      items: [
        { partId: "675526a65147b661d631771f", quantity: 2 },
        { partId: "675d22bf0dcafd91fa89f5a5", quantity: 1 }
      ],
      status: "Pending",
    };

    const response = await agent.post("/orders").send(newOrder);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Order created");
    expect(response.body).toHaveProperty("id");
    orderId = response.body.id;
  });

  it("should get an order by ID", async () => {
    const response = await agent.get(`/orders/${orderId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", orderId);
  });

  it("should update an order by ID", async () => {
    const updatedOrder = {
      status: "Shipped",
    };

    const response = await agent.put(`/orders/${orderId}`).send(updatedOrder);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Order updated");
  });

  it("should delete an order by ID", async () => {
    const response = await agent.delete(`/orders/${orderId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Order deleted");
  });

  it("should return 404 for a non-existent order", async () => {
    const response = await agent.get(`/orders/${orderId}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Order not found");
  });

  // Close the server after all tests
  afterAll(() => {
    server.close();
  });
});
