const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("Orders Routes - Authentication and Authorization Errors", () => {
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
  });

  it("should return 401 for unauthenticated access to get orders", async () => {
    // Simulate unauthenticated access to orders route
    const response = await request(app).get("/orders");
    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });

  it("should return 403 for a non-admin/non-employee trying to get orders", async () => {
    // Simulate login as a client (non-admin, non-employee)
    await agent.post("/test-login").send({
      _id: '675f5a4967f3af115a3136f8',
      role: 'client',
      email: 'client@example.com',
      githubId: 'mockGithubIdClient',
      displayName: 'Client User',
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    const response = await agent.get("/orders");
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  it("should return 403 for a non-admin/non-employee trying to update an order", async () => {
    // Simulate login as a client (non-admin, non-employee)
    await agent.post("/test-login").send({
      _id: '675f5a4967f3af115a3136f8',
      role: 'client',
      email: 'client@example.com',
      githubId: 'mockGithubIdClient',
      displayName: 'Client User',
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    const response = await agent.put("/orders/675bd5aaf7d0c29ac0257953").send({
      status: "Shipped",
    });
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  it("should return 401 for unauthenticated access to delete an order", async () => {
    const response = await request(app).delete("/orders/675bd5aaf7d0c29ac0257953");
    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });

  it("should return 403 for a non-admin/non-employee trying to delete an order", async () => {
    // Simulate login as a client (non-admin, non-employee)
    await agent.post("/test-login").send({
      _id: '675f5a4967f3af115a3136f8',
      role: 'client',
      email: 'client@example.com',
      githubId: 'mockGithubIdClient',
      displayName: 'Client User',
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    const response = await agent.delete("/orders/675bd5aaf7d0c29ac0257953");
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  // Close the server after all tests
  afterAll(() => {
    server.close();
  });
});
