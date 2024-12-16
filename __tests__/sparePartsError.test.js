const request = require("supertest");
const { app, startServer, connectToDatabase } = require("../unitTest");

describe("Spare Parts Routes - Error Scenarios", () => {
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

  it("should return 401 for unauthenticated access to spare parts", async () => {
    const response = await request(app).get("/spare-parts");
    expect(response.status).toBe(401);
    expect(response.text).toBe("Unauthorized");
  });

  it("should return 403 for unauthorized role trying to create a spare part", async () => {
    // Simulate login as a client (unauthorized role)
    await agent.post("/test-login").send({
      _id: "mockClientId",
      role: "client",
      email: "client@example.com",
      githubId: "mockGithubIdClient",
      displayName: "Mock Client",
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const newSparePart = {
      name: "Brake Pads",
      description: "Durable brake pads designed for safe and reliable stopping performance.",
      price: 59.99,
      stock: 120,
      compatibleCars: ["SUV", "Truck", "Sedan"],
      category: "Car Brake Components",
    };

    const response = await agent.post("/spare-parts").send(newSparePart);
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  it("should return 403 when trying to update spare part without admin or employee role", async () => {
    const updatedSparePart = { description: "Updated description" };

    const response = await agent.put("/spare-parts/675526a65147b661d631771f").send(updatedSparePart);
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  it("should return 403 when a non-admin tries to delete a spare part", async () => {
    const response = await agent.delete("/spare-parts/675526a65147b661d631771f");
    expect(response.status).toBe(403);
    expect(response.text).toBe("Forbidden: You do not have access.");
  });

  it("should return 404 when trying to access a non-existent spare part", async () => {
    // Simulate login as admin
    await agent.post("/test-login").send({
      _id: "mockAdminId",
      role: "admin",
      email: "admin@example.com",
      githubId: "mockGithubIdAdmin",
      displayName: "Mock Admin",
      avatarUrl: "https://example.com/avatar.jpg",
    });

    const response = await agent.get("/spare-parts/675f5a6867f3af115a3136f7");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Spare Part not found");
  });

  // Close the server after all tests
  afterAll(() => {
    server.close();
  });
});
